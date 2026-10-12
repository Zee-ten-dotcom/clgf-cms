import {
  Body, Controller, ForbiddenException, Get,
  Post, Req, UseGuards, BadRequestException,
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
}
