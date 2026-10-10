import {
  BadRequestException, Body, Controller, ForbiddenException,
  Get, Injectable, Module, Post, Req, UseGuards,
} from '@nestjs/common';
import {
  IsInt, IsString, IsUUID, Max, MaxLength, Min,
} from 'class-validator';
import { getDatabasePool } from '../database/database-pool';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AuthModule } from '../auth/auth.module';

class SavePlanDto {
  @IsUUID()
  ministryId!: string;

  @IsInt() @Min(2020) @Max(2100)
  year!: number;

  @IsString() @MaxLength(10000)
  vision!: string;

  @IsString() @MaxLength(10000)
  goals!: string;

  @IsString() @MaxLength(10000)
  programmes!: string;

  @IsString() @MaxLength(10000)
  budget!: string;

  @IsString() @MaxLength(10000)
  quarter1!: string;

  @IsString() @MaxLength(10000)
  quarter2!: string;

  @IsString() @MaxLength(10000)
  quarter3!: string;

  @IsString() @MaxLength(10000)
  quarter4!: string;
}

@Injectable()
class MinistryPlanningService {
  private async setup(client: any) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ministry_strategic_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ministry_id UUID NOT NULL
          REFERENCES ministries(id) ON DELETE CASCADE,
        plan_year INTEGER NOT NULL,
        vision TEXT NOT NULL DEFAULT '',
        goals TEXT NOT NULL DEFAULT '',
        programmes TEXT NOT NULL DEFAULT '',
        budget TEXT NOT NULL DEFAULT '',
        quarter1 TEXT NOT NULL DEFAULT '',
        quarter2 TEXT NOT NULL DEFAULT '',
        quarter3 TEXT NOT NULL DEFAULT '',
        quarter4 TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(ministry_id, plan_year)
      )
    `);
  }

  private memberId(user: any) {
    return user?.member_id ?? user?.memberId ?? null;
  }

  private authorize(user: any) {
    if (!['ADMIN', 'LEADER'].includes(user?.role)) {
      throw new ForbiddenException('Ministry leadership access required');
    }
  }

  async list(user: any) {
    this.authorize(user);
    const client = await getDatabasePool().connect();

    try {
      await this.setup(client);
      const admin = user.role === 'ADMIN';
      const memberId = this.memberId(user);

      if (!admin && !memberId) return [];

      const result = await client.query(`
        SELECT p.*, m.name AS ministry_name
        FROM ministry_strategic_plans p
        JOIN ministries m ON m.id = p.ministry_id
        WHERE $1::boolean OR m.leader_id = $2::uuid
        ORDER BY p.plan_year DESC, m.name ASC
      `, [admin, admin ? null : memberId]);

      return result.rows;
    } finally {
      client.release();
    }
  }

  async save(user: any, body: SavePlanDto) {
    this.authorize(user);
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only administrators can create or edit strategic plans',
      );
    }
    const client = await getDatabasePool().connect();

    try {
      await this.setup(client);

      const ministry = await client.query(
        'SELECT id, leader_id FROM ministries WHERE id = $1',
        [body.ministryId],
      );

      if (!ministry.rows.length) {
        throw new BadRequestException('Ministry not found');
      }

      if (
        user.role !== 'ADMIN' &&
        (
          !this.memberId(user) ||
          String(ministry.rows[0].leader_id) !==
          String(this.memberId(user))
        )
      ) {
        throw new ForbiddenException(
          'Only the assigned ministry leader can save this plan',
        );
      }

      const result = await client.query(`
        INSERT INTO ministry_strategic_plans (
          ministry_id, plan_year, vision, goals,
          programmes, budget, quarter1, quarter2,
          quarter3, quarter4
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (ministry_id, plan_year)
        DO UPDATE SET
          vision = EXCLUDED.vision,
          goals = EXCLUDED.goals,
          programmes = EXCLUDED.programmes,
          budget = EXCLUDED.budget,
          quarter1 = EXCLUDED.quarter1,
          quarter2 = EXCLUDED.quarter2,
          quarter3 = EXCLUDED.quarter3,
          quarter4 = EXCLUDED.quarter4,
          updated_at = NOW()
        RETURNING *
      `, [
        body.ministryId, body.year, body.vision,
        body.goals, body.programmes, body.budget,
        body.quarter1, body.quarter2, body.quarter3,
        body.quarter4,
      ]);

      return result.rows[0];
    } finally {
      client.release();
    }
  }
}

@Controller('ministry-planning')
@UseGuards(JwtAuthGuard, RolesGuard)
class MinistryPlanningController {
  constructor(private readonly service: MinistryPlanningService) {}

  @Get()
  list(@Req() req: any) {
    return this.service.list(req.user);
  }

  @Post()
  save(@Req() req: any, @Body() body: SavePlanDto) {
    return this.service.save(req.user, body);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [MinistryPlanningController],
  providers: [MinistryPlanningService],
})
export class MinistryPlanningModule {}
