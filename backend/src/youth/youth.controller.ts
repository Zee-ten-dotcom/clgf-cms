import {
  Body, Controller, Delete, ForbiddenException, Get,
  Post, Req, UseGuards, BadRequestException, ParseUUIDPipe, Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { getDatabasePool } from '../database/database-pool';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'LEADER')
@Controller('youth')
export class YouthController {
  private async authorize(user: any) {
    if (user?.role === 'ADMIN') return;
    if (user?.role !== 'LEADER' || !user?.sub)
      throw new ForbiddenException('Access denied');

    const db = await getDatabasePool().connect();
    try {
      const result = await db.query(`
        SELECT 1
        FROM users u
        JOIN leadership_assignments l ON l.member_id = u.member_id
        WHERE u.id = $1
          AND u.is_active = true
          AND l.status = 'ACTIVE'
          AND LOWER(TRIM(l.role_title)) IN
            ('youth leader', 'youth minister', 'youth ministry leader')
        LIMIT 1
      `, [user.sub]);

      if (!result.rowCount)
        throw new ForbiddenException('Assigned Youth Leader required');
    } finally {
      db.release();
    }
  }

  @Get('services')
  async list(@Req() req: any) {
    await this.authorize(req.user);
    const db = await getDatabasePool().connect();
    try {
      const result = await db.query(`
        SELECT * FROM events
        WHERE event_type = 'YOUTH_SERVICE'
        ORDER BY event_date DESC
      `);
      return result.rows;
    } finally {
      db.release();
    }
  }

  @Post('services')
  async create(@Req() req: any, @Body() body: any) {
    await this.authorize(req.user);

    if (!body.title?.trim() || !body.eventDate)
      throw new BadRequestException('Title and date required');

    const db = await getDatabasePool().connect();
    try {
      const result = await db.query(`
        INSERT INTO events
          (title, description, event_date, start_time,
           end_time, location, event_type, status)
        VALUES ($1,$2,$3,$4,$5,$6,'YOUTH_SERVICE','SCHEDULED')
        RETURNING *
      `, [
        body.title.trim(),
        body.description || '',
        body.eventDate,
        body.startTime || '16:00',
        body.endTime || '18:00',
        body.location || 'CLGF Main Sanctuary',
      ]);
      return result.rows[0];
    } finally {
      db.release();
    }
  }

  @Get('attendance')
  async attendance(@Req() req: any) {
    await this.authorize(req.user);
    const db = await getDatabasePool().connect();
    try {
      const result = await db.query(`
        SELECT s.*, COUNT(r.id)::int AS total_marked,
          COUNT(r.id) FILTER (WHERE r.status = 'PRESENT')::int AS present,
          COUNT(r.id) FILTER (WHERE r.status = 'ABSENT')::int AS absent
        FROM attendance_sessions s
        LEFT JOIN attendance_records r ON r.session_id = s.id
        WHERE s.service_type = 'YOUTH_SERVICE'
          AND s.home_cell_id IS NULL
        GROUP BY s.id
        ORDER BY s.service_date DESC
      `);
      return result.rows;
    } finally {
      db.release();
    }
  }

  @Post('attendance')
  async createAttendance(@Req() req: any, @Body() body: any) {
    await this.authorize(req.user);
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(body.serviceDate || ''))
      throw new BadRequestException('Valid service date required');

    const db = await getDatabasePool().connect();
    try {
      const result = await db.query(`
        INSERT INTO attendance_sessions
          (service_date, service_type, home_cell_id, notes)
        VALUES ($1, 'YOUTH_SERVICE', NULL, $2)
        RETURNING *
      `, [body.serviceDate, body.notes || null]);
      return result.rows[0];
    } finally {
      db.release();
    }
  }

  @Post('attendance/:sessionId/members')
  async markYouthAttendance(
    @Req() req: any,
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Body() body: any,
  ) {
    await this.authorize(req.user);
    if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(body.memberId || ''))
      throw new BadRequestException('Valid member required');
    if (!['PRESENT', 'ABSENT'].includes(body.status))
      throw new BadRequestException('Invalid attendance status');

    const db = await getDatabasePool().connect();
    try {
      const result = await db.query(`
        INSERT INTO attendance_records (session_id, member_id, status)
        SELECT s.id, m.id, $3
        FROM attendance_sessions s
        CROSS JOIN members m
        WHERE s.id = $1 AND m.id = $2
          AND s.service_type = 'YOUTH_SERVICE'
          AND s.home_cell_id IS NULL
        ON CONFLICT (session_id, member_id)
        DO UPDATE SET status = EXCLUDED.status
        RETURNING *
      `, [sessionId, body.memberId, body.status]);

      if (!result.rowCount)
        throw new BadRequestException('Youth session or member not found');
      return result.rows[0];
    } finally {
      db.release();
    }
  }

  @Get('programs')
  async programs(@Req() req: any) {
    await this.authorize(req.user);
    const db = await getDatabasePool().connect();
    try {
      const result = await db.query(`
        SELECT * FROM events
        WHERE event_type = 'YOUTH_PROGRAM'
        ORDER BY event_date DESC, start_time ASC
      `);
      return result.rows;
    } finally {
      db.release();
    }
  }

  @Post('programs')
  async createProgram(@Req() req: any, @Body() body: any) {
    await this.authorize(req.user);

    if (
      typeof body.title !== 'string' ||
      !body.title.trim() ||
      !/^\\d{4}-\\d{2}-\\d{2}$/.test(body.eventDate || '')
    ) {
      throw new BadRequestException('Title and valid date required');
    }

    const db = await getDatabasePool().connect();
    try {
      const result = await db.query(`
        INSERT INTO events
          (title, description, event_date, start_time,
           end_time, location, event_type, status)
        VALUES ($1,$2,$3,$4,$5,$6,'YOUTH_PROGRAM','SCHEDULED')
        RETURNING *
      `, [
        body.title.trim(),
        body.description || '',
        body.eventDate,
        body.startTime || '16:00',
        body.endTime || '18:00',
        body.location || 'CLGF Main Sanctuary',
      ]);
      return result.rows[0];
    } finally {
      db.release();
    }
  }

  @Get('reports')
  async reports(@Req() req: any) {
    await this.authorize(req.user);
    const db = await getDatabasePool().connect();
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS youth_monthly_reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          report_month VARCHAR(7) NOT NULL UNIQUE,
          achievements TEXT NOT NULL DEFAULT '',
          challenges TEXT NOT NULL DEFAULT '',
          plans TEXT NOT NULL DEFAULT '',
          submitted_by UUID REFERENCES users(id),
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      const result = await db.query(`
        SELECT * FROM youth_monthly_reports
        ORDER BY report_month DESC
      `);
      return result.rows;
    } finally {
      db.release();
    }
  }

  @Post('reports')
  async createReport(@Req() req: any, @Body() body: any) {
    await this.authorize(req.user);

    if (!/^\\d{4}-(0[1-9]|1[0-2])$/.test(body.reportMonth || ''))
      throw new BadRequestException('Valid report month required');

    const db = await getDatabasePool().connect();
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS youth_monthly_reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          report_month VARCHAR(7) NOT NULL UNIQUE,
          achievements TEXT NOT NULL DEFAULT '',
          challenges TEXT NOT NULL DEFAULT '',
          plans TEXT NOT NULL DEFAULT '',
          submitted_by UUID REFERENCES users(id),
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      const result = await db.query(`
        INSERT INTO youth_monthly_reports
          (report_month, achievements, challenges, plans, submitted_by)
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT (report_month)
        DO UPDATE SET
          achievements = EXCLUDED.achievements,
          challenges = EXCLUDED.challenges,
          plans = EXCLUDED.plans,
          submitted_by = EXCLUDED.submitted_by
        RETURNING *
      `, [
        body.reportMonth,
        body.achievements || '',
        body.challenges || '',
        body.plans || '',
        req.user.sub,
      ]);
      return result.rows[0];
    } finally {
      db.release();
    }
  }

  @Get('members')
  async youthMembers(@Req() req: any) {
    await this.authorize(req.user);
    const db = await getDatabasePool().connect();
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS youth_ministry_members (
          member_id UUID PRIMARY KEY REFERENCES members(id)
            ON DELETE CASCADE,
          added_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      const result = await db.query(`
        SELECT m.id, m.first_name, m.last_name,
          m.membership_number, m.status
        FROM youth_ministry_members y
        JOIN members m ON m.id = y.member_id
        ORDER BY m.first_name, m.last_name
      `);
      return result.rows;
    } finally {
      db.release();
    }
  }

  @Post('members')
  async addYouthMember(@Req() req: any, @Body() body: any) {
    await this.authorize(req.user);
    const db = await getDatabasePool().connect();
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS youth_ministry_members (
          member_id UUID PRIMARY KEY REFERENCES members(id)
            ON DELETE CASCADE,
          added_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      const result = await db.query(`
        INSERT INTO youth_ministry_members (member_id)
        SELECT id FROM members WHERE id = $1
        ON CONFLICT (member_id) DO NOTHING
        RETURNING member_id
      `, [body.memberId]);

      if (!result.rowCount)
        throw new BadRequestException(
          'Member not found or already in Youth Ministry'
        );
      return result.rows[0];
    } finally {
      db.release();
    }
  }

  @Delete('members/:memberId')
  async removeYouthMember(
    @Req() req: any,
    @Param('memberId', new ParseUUIDPipe()) memberId: string,
  ) {
    await this.authorize(req.user);
    const db = await getDatabasePool().connect();
    try {
      const result = await db.query(
        'DELETE FROM youth_ministry_members WHERE member_id = $1 RETURNING member_id',
        [memberId],
      );
      if (!result.rowCount)
        throw new BadRequestException('Youth member not found');
      return { success: true };
    } finally {
      db.release();
    }
  }

}
