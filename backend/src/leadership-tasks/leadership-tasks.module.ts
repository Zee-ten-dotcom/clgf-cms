import {
  BadRequestException, Body, Controller, ForbiddenException,
  Get, Injectable, Module, Param, Patch, Post, Req, UseGuards,
} from '@nestjs/common';
import {
  IsIn, IsOptional, IsString, IsUUID, Matches, MaxLength,
} from 'class-validator';
import { getDatabasePool } from '../database/database-pool';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AuthModule } from '../auth/auth.module';

class CreateTaskDto {
  @IsString() @MaxLength(180)
  title!: string;

  @IsString() @MaxLength(5000)
  description!: string;

  @IsUUID()
  memberId!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  dueDate!: string;

  @IsIn(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
  priority!: string;
}

class UpdateTaskDto {
  @IsIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
  status!: string;

  @IsOptional() @IsString() @MaxLength(5000)
  progressNote?: string;
}

@Injectable()
class LeadershipTasksService {
  private async setup(client: any) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS leadership_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(180) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        member_id UUID NOT NULL REFERENCES members(id),
        due_date DATE NOT NULL,
        priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        progress_note TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  private async setupHistory(client: any) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS leadership_task_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL
          REFERENCES leadership_tasks(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL,
        progress_note TEXT NOT NULL DEFAULT '',
        updated_by VARCHAR(120) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  private memberId(user: any) {
    return user?.member_id ?? user?.memberId ?? null;
  }

  private authorize(user: any) {
    if (!['ADMIN', 'LEADER'].includes(user?.role)) {
      throw new ForbiddenException('Leadership access required');
    }
  }

  async list(user: any) {
    this.authorize(user);
    const client = await getDatabasePool().connect();
    try {
      await this.setup(client);
      await this.setupHistory(client);
      const admin = user.role === 'ADMIN';
      const memberId = this.memberId(user);
      if (!admin && !memberId) return [];

      const result = await client.query(`
        SELECT t.*, m.first_name, m.last_name,
          COALESCE((
            SELECT json_agg(
              json_build_object(
                'status', h.status,
                'progress_note', h.progress_note,
                'updated_by', h.updated_by,
                'created_at', h.created_at
              ) ORDER BY h.created_at DESC
            )
            FROM leadership_task_history h
            WHERE h.task_id = t.id
          ), '[]'::json) AS history,
          CASE
            WHEN t.status <> 'COMPLETED'
             AND t.due_date < CURRENT_DATE THEN TRUE
            ELSE FALSE
          END AS overdue
        FROM leadership_tasks t
        JOIN members m ON m.id = t.member_id
        WHERE $1::boolean OR t.member_id = $2::uuid
        ORDER BY t.due_date ASC, t.created_at DESC
      `, [admin, admin ? null : memberId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async create(user: any, body: CreateTaskDto) {
    if (user?.role !== 'ADMIN') {
      throw new ForbiddenException('Administrator access required');
    }
    if (!body.title?.trim() || !body.description?.trim()) {
      throw new BadRequestException('Title and description required');
    }
    if (Number.isNaN(Date.parse(body.dueDate))) {
      throw new BadRequestException('Invalid deadline');
    }

    const client = await getDatabasePool().connect();
    try {
      await this.setup(client);
      const leader = await client.query(`
        SELECT id FROM leadership_assignments
        WHERE member_id = $1 AND status = 'ACTIVE'
        LIMIT 1
      `, [body.memberId]);
      if (!leader.rows.length) {
        throw new BadRequestException('Select an active church leader');
      }
      const result = await client.query(`
        INSERT INTO leadership_tasks
          (title, description, member_id, due_date, priority)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        body.title.trim(), body.description.trim(),
        body.memberId, body.dueDate, body.priority,
      ]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async update(user: any, id: string, body: UpdateTaskDto) {
    this.authorize(user);
    const client = await getDatabasePool().connect();
    try {
      await this.setup(client);
      await this.setupHistory(client);
      await client.query('BEGIN');
      const result = await client.query(`
        UPDATE leadership_tasks
        SET status = $1,
            progress_note = COALESCE($2, progress_note),
            updated_at = NOW()
        WHERE id = $3
          AND ($4::boolean OR member_id = $5::uuid)
        RETURNING *
      `, [
        body.status, body.progressNote ?? null, id,
        user.role === 'ADMIN',
        user.role === 'ADMIN' ? null : this.memberId(user),
      ]);
      if (!result.rows.length) {
        throw new ForbiddenException('Task not found or access denied');
      }
      const task = result.rows[0];
      await client.query(`
        INSERT INTO leadership_task_history
          (task_id, status, progress_note, updated_by)
        VALUES ($1, $2, $3, $4)
      `, [
        task.id,
        task.status,
        body.progressNote ?? '',
        String(
          user?.first_name ??
          user?.firstName ??
          user?.email ??
          user?.role ??
          'Leader'
        ).slice(0, 120),
      ]);
      await client.query('COMMIT');
      return task;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }
}

@Controller('leadership-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
class LeadershipTasksController {
  constructor(private readonly service: LeadershipTasksService) {}

  @Get()
  list(@Req() req: any) {
    return this.service.list(req.user);
  }

  @Post()
  create(@Req() req: any, @Body() body: CreateTaskDto) {
    return this.service.create(req.user, body);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
  ) {
    return this.service.update(req.user, id, body);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [LeadershipTasksController],
  providers: [LeadershipTasksService],
})
export class LeadershipTasksModule {}
