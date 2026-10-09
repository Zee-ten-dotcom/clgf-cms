import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { getDatabasePool } from '../database/database-pool';

type AuthUser = {
  sub: string;
  role: string;
};

@Injectable()
export class PastoralFollowUpsService {
  private async checkAccess(
    client: any,
    caseId: string,
    user: AuthUser,
  ) {
    if (!user || !['ADMIN', 'LEADER'].includes(user.role)) {
      throw new ForbiddenException('Access denied');
    }

    const result = await client.query(
      `SELECT assigned_leader_id
       FROM pastoral_care_records
       WHERE id = $1`,
      [caseId],
    );

    if (!result.rows.length) {
      throw new NotFoundException('Pastoral care case not found');
    }

    if (user.role === 'LEADER') {
      const leader = await client.query(
        `SELECT member_id
         FROM users
         WHERE id = $1 AND is_active = TRUE`,
        [user.sub],
      );

      const memberId = leader.rows[0]?.member_id;

      if (
        !memberId ||
        memberId !== result.rows[0].assigned_leader_id
      ) {
        throw new NotFoundException('Pastoral care case not found');
      }
    }
  }

  async findAll(caseId: string, user: AuthUser) {
    const client = await getDatabasePool().connect();

    try {
      await this.checkAccess(client, caseId, user);

      const result = await client.query(
        `SELECT *
         FROM pastoral_care_follow_ups
         WHERE pastoral_care_id = $1
         ORDER BY follow_up_date DESC, created_at DESC`,
        [caseId],
      );

      return result.rows;
    } finally {
      client.release();
    }
  }

  async create(
    caseId: string,
    user: AuthUser,
    data: {
      followUpDate: string;
      contactMethod: string;
      outcome: string;
      notes?: string;
      nextFollowUpDate?: string;
    },
  ) {
    const methods = [
      'PHONE',
      'HOME_VISIT',
      'CHURCH_MEETING',
      'PRAYER',
      'MESSAGE',
      'OTHER',
    ];

    const outcomes = [
      'SUCCESSFUL',
      'NO_ANSWER',
      'RESCHEDULED',
      'NEEDS_SUPPORT',
    ];

    if (
      !data.followUpDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.followUpDate)
    ) {
      throw new BadRequestException('Valid follow-up date required');
    }

    if (!methods.includes(data.contactMethod)) {
      throw new BadRequestException('Invalid contact method');
    }

    if (!outcomes.includes(data.outcome)) {
      throw new BadRequestException('Invalid outcome');
    }

    const client = await getDatabasePool().connect();

    try {
      await client.query('BEGIN');

await client.query(
  `SELECT id FROM pastoral_care_records
   WHERE id = $1 FOR UPDATE`,
  [caseId],
);

await this.checkAccess(client, caseId, user);

      const result = await client.query(
        `INSERT INTO pastoral_care_follow_ups (
          pastoral_care_id,
          recorded_by_user_id,
          follow_up_date,
          contact_method,
          outcome,
          notes,
          next_follow_up_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          caseId,
          user.sub,
          data.followUpDate,
          data.contactMethod,
          data.outcome,
          data.notes?.trim() || null,
          data.nextFollowUpDate || null,
        ],
      );

      if (data.nextFollowUpDate) {
        await client.query(
          `UPDATE pastoral_care_records
           SET follow_up_date = $1,
               status = 'FOLLOW_UP',
               updated_at = NOW()
           WHERE id = $2`,
          [data.nextFollowUpDate, caseId],
        );
      }

      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
