import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { getDatabasePool } from '../database/database-pool';

@Injectable()
export class MemberTransfersService {
  private db() {
    return getDatabasePool().connect();
  }

  async list(actor: any) {
    const client = await this.db();
    try {
      const result = await client.query(
        `SELECT t.*, m.first_name, m.last_name,
                old.name AS from_home_cell_name,
                dest.name AS to_home_cell_name
         FROM member_transfers t
         JOIN members m ON m.id = t.member_id
         LEFT JOIN home_cells old ON old.id = t.from_home_cell_id
         JOIN home_cells dest ON dest.id = t.to_home_cell_id
         WHERE $1 = 'ADMIN'
            OR EXISTS (
              SELECT 1 FROM users u
              JOIN home_cells h ON h.leader_id = u.member_id
              WHERE u.id = $2 AND u.is_active = TRUE
                AND h.status = 'ACTIVE'
                AND h.id = t.from_home_cell_id
            )
         ORDER BY t.requested_at DESC`,
        [actor.role, actor.sub],
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async request(
    memberId: string,
    toHomeCellId: string,
    reason: string,
    actor: any,
  ) {
    const client = await this.db();
    try {
      await client.query('BEGIN');

      const member = await client.query(
        'SELECT home_cell_id FROM members WHERE id = $1 FOR UPDATE',
        [memberId],
      );
      if (!member.rowCount) {
        throw new BadRequestException('Member not found');
      }

      const fromId = member.rows[0].home_cell_id;

      if (fromId === toHomeCellId) {
        throw new BadRequestException('Member already belongs to this Home Cell');
      }

      if (actor.role !== 'ADMIN') {
        const allowed = await client.query(
          `SELECT 1 FROM users u
           JOIN home_cells h ON h.leader_id = u.member_id
           WHERE u.id = $1 AND u.is_active = TRUE
             AND h.id = $2 AND h.status = 'ACTIVE'`,
          [actor.sub, fromId],
        );
        if (!allowed.rowCount) {
          throw new ForbiddenException('Not your assigned Home Cell');
        }
      }

      const destination = await client.query(
        `SELECT 1 FROM home_cells
         WHERE id = $1 AND status = 'ACTIVE'`,
        [toHomeCellId],
      );
      if (!destination.rowCount) {
        throw new BadRequestException('Destination Home Cell is not active');
      }

      const pending = await client.query(
        `SELECT 1 FROM member_transfers
         WHERE member_id = $1 AND status = 'PENDING'`,
        [memberId],
      );
      if (pending.rowCount) {
        throw new BadRequestException('Member already has a pending transfer');
      }

      const result = await client.query(
        `INSERT INTO member_transfers
         (member_id, from_home_cell_id, to_home_cell_id,
          reason, requested_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [memberId, fromId, toHomeCellId, reason, actor.sub],
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async review(
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    actor: any,
  ) {
    if (actor.role !== 'ADMIN') {
      throw new ForbiddenException('Admin approval required');
    }

    const client = await this.db();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        'SELECT * FROM member_transfers WHERE id = $1 FOR UPDATE',
        [id],
      );

      if (!result.rowCount) {
        throw new BadRequestException('Transfer not found');
      }

      const transfer = result.rows[0];

      if (transfer.status !== 'PENDING') {
        throw new BadRequestException('Transfer already reviewed');
      }

      if (decision === 'APPROVED') {
        const updated = await client.query(
          `UPDATE members
           SET home_cell_id = $1, updated_at = NOW()
           WHERE id = $2
             AND home_cell_id IS NOT DISTINCT FROM $3
             AND EXISTS (
               SELECT 1 FROM home_cells
               WHERE id = $1 AND status = 'ACTIVE'
             )
           RETURNING id`,
          [
            transfer.to_home_cell_id,
            transfer.member_id,
            transfer.from_home_cell_id,
          ],
        );

        if (!updated.rowCount) {
          throw new BadRequestException(
            'Home Cell assignment changed or destination is inactive',
          );
        }
      }

      const reviewed = await client.query(
        `UPDATE member_transfers
         SET status = $1, reviewed_by = $2, reviewed_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [decision, actor.sub, id],
      );

      await client.query('COMMIT');
      return reviewed.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
