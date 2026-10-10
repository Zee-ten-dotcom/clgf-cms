import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { getDatabasePool } from '../database/database-pool';

@Injectable()
export class MemberFollowupRequestsService {
  private db() {
    return getDatabasePool().connect();
  }

  async list(actor: any) {
    const client = await this.db();
    try {
      const result = await client.query(
        `SELECT r.*, m.first_name, m.last_name,
                h.name AS home_cell_name
         FROM member_followup_requests r
         JOIN members m ON m.id = r.member_id
         LEFT JOIN home_cells h ON h.id = m.home_cell_id
         WHERE $1 = 'ADMIN'
            OR r.requested_by = $2
         ORDER BY r.created_at DESC`,
        [actor.role, actor.sub],
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async request(memberId: string, reason: string, actor: any) {
    const client = await this.db();
    try {
      const member = await client.query(
        `SELECT m.id
         FROM members m
         WHERE m.id = $1
           AND (
             $2 = 'ADMIN'
             OR EXISTS (
               SELECT 1 FROM users u
               JOIN home_cells h ON h.leader_id = u.member_id
               WHERE u.id = $3
                 AND u.is_active = TRUE
                 AND h.status = 'ACTIVE'
                 AND h.id = m.home_cell_id
             )
           )`,
        [memberId, actor.role, actor.sub],
      );

      if (!member.rowCount) {
        throw new ForbiddenException(
          'Member not found or not assigned to your Home Cell',
        );
      }

      const existing = await client.query(
        `SELECT id FROM member_followup_requests
         WHERE member_id = $1 AND status = 'PENDING'`,
        [memberId],
      );

      if (existing.rowCount) {
        throw new BadRequestException(
          'This member already has a pending follow-up request',
        );
      }

      const result = await client.query(
        `INSERT INTO member_followup_requests
         (member_id, requested_by, reason)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [memberId, actor.sub, reason.trim()],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async review(
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    actor: any,
  ) {
    const client = await this.db();
    try {
      const result = await client.query(
        `UPDATE member_followup_requests
         SET status = $2,
             reviewed_by = $3,
             reviewed_at = NOW()
         WHERE id = $1 AND status = 'PENDING'
         RETURNING *`,
        [id, decision, actor.sub],
      );

      if (!result.rowCount) {
        throw new BadRequestException(
          'Request not found or already reviewed',
        );
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }
}
