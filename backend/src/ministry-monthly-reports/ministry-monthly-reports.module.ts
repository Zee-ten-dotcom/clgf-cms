import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Injectable,
  Module,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsIn, IsString, IsUUID, Matches, MaxLength } from 'class-validator';
import { getDatabasePool } from '../database/database-pool';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AuthModule } from '../auth/auth.module';

class SaveReportDto {
  @IsUUID()
  ministryId!: string;

  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  month!: string;

  @IsString()
  @MaxLength(10000)
  activities!: string;

  @IsString()
  @MaxLength(10000)
  achievements!: string;

  @IsString()
  @MaxLength(10000)
  challenges!: string;

  @IsString()
  @MaxLength(10000)
  assistanceRequired!: string;

  @IsString()
  @MaxLength(10000)
  nextPlans!: string;

  @IsIn(['DRAFT', 'SUBMITTED'])
  status!: 'DRAFT' | 'SUBMITTED';
}

@Injectable()
class MinistryMonthlyReportsService {
  private async setup(client: any) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ministry_monthly_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ministry_id UUID NOT NULL
          REFERENCES ministries(id) ON DELETE CASCADE,
        report_month VARCHAR(7) NOT NULL,
        activities TEXT NOT NULL DEFAULT '',
        achievements TEXT NOT NULL DEFAULT '',
        challenges TEXT NOT NULL DEFAULT '',
        assistance_required TEXT NOT NULL DEFAULT '',
        next_plans TEXT NOT NULL DEFAULT '',
        status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
          CHECK (status IN ('DRAFT', 'SUBMITTED')),
        submitted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (ministry_id, report_month)
      )
    `);
  }

  private async permitted(client: any, user: any, ministryId: string) {
    const result = await client.query(
      'SELECT id, leader_id FROM ministries WHERE id = $1',
      [ministryId],
    );

    if (!result.rows.length) {
      throw new BadRequestException('Ministry not found');
    }

    if (user?.role === 'ADMIN') return;

    // Fail closed if the authenticated leader has no linked member ID.
    const memberId = user?.member_id ?? user?.memberId;

    if (
      !memberId ||
      String(result.rows[0].leader_id) !== String(memberId)
    ) {
      throw new ForbiddenException(
        'Only the assigned ministry leader may access this report',
      );
    }
  }

  async list(user: any) {
    const client = await getDatabasePool().connect();
    try {
      await this.setup(client);

      const memberId = user?.member_id ?? user?.memberId;

      if (user?.role !== 'ADMIN' && !memberId) return [];

      const admin = user?.role === 'ADMIN';

      const result = await client.query(
        `
        SELECT r.*, m.name AS ministry_name
        FROM ministry_monthly_reports r
        JOIN ministries m ON m.id = r.ministry_id
        WHERE $1::boolean OR m.leader_id = $2::uuid
        ORDER BY r.report_month DESC, m.name ASC
        `,
        [admin, admin ? null : memberId],
      );

      return result.rows;
    } finally {
      client.release();
    }
  }

  async save(user: any, body: SaveReportDto) {
    const client = await getDatabasePool().connect();

    try {
      await this.setup(client);
      await this.permitted(client, user, body.ministryId);

      const result = await client.query(
        `
        INSERT INTO ministry_monthly_reports (
          ministry_id, report_month, activities, achievements,
          challenges, assistance_required, next_plans,
          status, submitted_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,
          CASE WHEN $8::varchar = 'SUBMITTED' THEN NOW() ELSE NULL END)
        ON CONFLICT (ministry_id, report_month)
        DO UPDATE SET
          activities = EXCLUDED.activities,
          achievements = EXCLUDED.achievements,
          challenges = EXCLUDED.challenges,
          assistance_required = EXCLUDED.assistance_required,
          next_plans = EXCLUDED.next_plans,
          status = EXCLUDED.status,
          submitted_at =
            CASE WHEN EXCLUDED.status = 'SUBMITTED'
              THEN COALESCE(
                ministry_monthly_reports.submitted_at, NOW()
              )
              ELSE NULL
            END,
          updated_at = NOW()
        RETURNING *
        `,
        [
          body.ministryId,
          body.month,
          body.activities,
          body.achievements,
          body.challenges,
          body.assistanceRequired,
          body.nextPlans,
          body.status,
        ],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }
}

@Controller('ministry-monthly-reports')
@UseGuards(JwtAuthGuard, RolesGuard)
class MinistryMonthlyReportsController {
  constructor(private readonly service: MinistryMonthlyReportsService) {}

  @Get()
  list(@Req() request: any) {
    return this.service.list(request.user);
  }

  @Post()
  save(@Req() request: any, @Body() body: SaveReportDto) {
    return this.service.save(request.user, body);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [MinistryMonthlyReportsController],
  providers: [MinistryMonthlyReportsService],
})
export class MinistryMonthlyReportsModule {}
