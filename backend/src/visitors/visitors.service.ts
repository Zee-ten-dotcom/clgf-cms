import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { getDatabasePool } from '../database/database-pool';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { UpdateVisitorFollowUpDto } from './dto/update-visitor-follow-up.dto';

@Injectable()
export class VisitorsService {
  private async db() {
    return getDatabasePool().connect();
  }

  async findAll() {
    const client = await this.db();

    try {
      const result = await client.query(`
        SELECT
          v.*,
          CONCAT(
            leader.first_name,
            ' ',
            leader.last_name
          ) AS assigned_leader_name,
          CONCAT(
            converted.first_name,
            ' ',
            converted.last_name
          ) AS converted_member_name,
          converted.membership_number
            AS converted_membership_number
        FROM visitors v
        LEFT JOIN members leader
          ON leader.id = v.assigned_leader_id
        LEFT JOIN members converted
          ON converted.id = v.converted_member_id
        ORDER BY
          v.last_visit_date DESC,
          v.created_at DESC
      `);

      return result.rows;
    } finally {
      client.release();
    }
  }

  async findOne(id: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        SELECT
          v.*,
          CONCAT(
            leader.first_name,
            ' ',
            leader.last_name
          ) AS assigned_leader_name,
          CONCAT(
            converted.first_name,
            ' ',
            converted.last_name
          ) AS converted_member_name,
          converted.membership_number
            AS converted_membership_number
        FROM visitors v
        LEFT JOIN members leader
          ON leader.id = v.assigned_leader_id
        LEFT JOIN members converted
          ON converted.id = v.converted_member_id
        WHERE v.id = $1
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Visitor not found',
        );
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async create(data: CreateVisitorDto) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        INSERT INTO visitors (
          first_name,
          last_name,
          phone,
          email,
          address,
          first_visit_date,
          last_visit_date,
          visit_count,
          invited_by,
          visit_context,
          follow_up_status,
          assigned_leader_id,
          follow_up_notes,
          membership_interest
        )
        VALUES (
          $1,$2,$3,$4,$5,
          COALESCE($6::date, CURRENT_DATE),
          COALESCE($7::date, CURRENT_DATE),
          $8,$9,$10,$11,$12,$13,$14
        )
        RETURNING *
        `,
        [
          data.firstName.trim(),
          data.lastName.trim(),
          data.phone?.trim() || null,
          data.email?.trim() || null,
          data.address?.trim() || null,
          data.firstVisitDate || null,
          data.lastVisitDate || null,
          data.visitCount ?? 1,
          data.invitedBy?.trim() || null,
          data.visitContext?.trim() || null,
          data.followUpStatus?.trim().toUpperCase()
            || 'NEW',
          data.assignedLeaderId || null,
          data.followUpNotes?.trim() || null,
          data.membershipInterest ?? false,
        ],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async update(
    id: string,
    data: UpdateVisitorDto,
  ) {
    const client = await this.db();

    try {
      const current = await client.query(
        `SELECT status FROM visitors WHERE id = $1`,
        [id],
      );

      if (current.rows.length === 0) {
        throw new BadRequestException(
          'Visitor not found',
        );
      }

      if (current.rows[0].status === 'CONVERTED') {
        throw new BadRequestException(
          'Converted visitor cannot be edited',
        );
      }

      const result = await client.query(
        `
        UPDATE visitors
        SET
          first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          phone = COALESCE($3, phone),
          email = COALESCE($4, email),
          address = COALESCE($5, address),
          first_visit_date =
            COALESCE($6::date, first_visit_date),
          last_visit_date =
            COALESCE($7::date, last_visit_date),
          visit_count =
            COALESCE($8, visit_count),
          invited_by =
            COALESCE($9, invited_by),
          visit_context =
            COALESCE($10, visit_context),
          follow_up_status =
            COALESCE($11, follow_up_status),
          assigned_leader_id =
            COALESCE($12, assigned_leader_id),
          follow_up_notes =
            COALESCE($13, follow_up_notes),
          membership_interest =
            COALESCE($14, membership_interest),
          updated_at = NOW()
        WHERE id = $15
        RETURNING *
        `,
        [
          data.firstName?.trim() || null,
          data.lastName?.trim() || null,
          data.phone?.trim() || null,
          data.email?.trim() || null,
          data.address?.trim() || null,
          data.firstVisitDate || null,
          data.lastVisitDate || null,
          data.visitCount ?? null,
          data.invitedBy?.trim() || null,
          data.visitContext?.trim() || null,
          data.followUpStatus?.trim().toUpperCase()
            || null,
          data.assignedLeaderId || null,
          data.followUpNotes?.trim() || null,
          data.membershipInterest ?? null,
          id,
        ],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updateFollowUp(
    id: string,
    data: UpdateVisitorFollowUpDto,
  ) {
    const client = await this.db();

    try {
      const current = await client.query(
        `SELECT status FROM visitors WHERE id = $1`,
        [id],
      );

      if (current.rows.length === 0) {
        throw new BadRequestException(
          'Visitor not found',
        );
      }

      if (current.rows[0].status === 'CONVERTED') {
        throw new BadRequestException(
          'Converted visitor cannot be updated',
        );
      }

      const result = await client.query(
        `
        UPDATE visitors
        SET
          follow_up_status =
            COALESCE($1, follow_up_status),
          assigned_leader_id =
            COALESCE($2, assigned_leader_id),
          follow_up_notes =
            COALESCE($3, follow_up_notes),
          last_visit_date =
            COALESCE($4::date, last_visit_date),
          visit_count =
            COALESCE($5, visit_count),
          updated_at = NOW()
        WHERE id = $6
        RETURNING *
        `,
        [
          data.followUpStatus
            ?.trim()
            .toUpperCase() || null,
          data.assignedLeaderId || null,
          data.followUpNotes?.trim() || null,
          data.lastVisitDate || null,
          data.visitCount ?? null,
          id,
        ],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async archive(id: string) {
    return this.changeStatus(
      id,
      'ARCHIVED',
    );
  }

  async reactivate(id: string) {
    return this.changeStatus(
      id,
      'ACTIVE',
    );
  }

  private async changeStatus(
    id: string,
    status: 'ACTIVE' | 'ARCHIVED',
  ) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        UPDATE visitors
        SET status = $1, updated_at = NOW()
        WHERE id = $2
          AND status <> 'CONVERTED'
        RETURNING *
        `,
        [status, id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Visitor not found or already converted',
        );
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async convertToMember(id: string) {
    const client = await this.db();

    try {
      await client.query('BEGIN');

      const visitorResult = await client.query(
        `
        SELECT *
        FROM visitors
        WHERE id = $1
        FOR UPDATE
        `,
        [id],
      );

      if (visitorResult.rows.length === 0) {
        throw new BadRequestException(
          'Visitor not found',
        );
      }

      const visitor = visitorResult.rows[0];

      if (
        visitor.status === 'CONVERTED'
        || visitor.converted_member_id
      ) {
        throw new BadRequestException(
          'Visitor has already been converted',
        );
      }

      const membershipNumber =
        `CLGF-${Date.now()}`;

      const memberResult = await client.query(
        `
        INSERT INTO members (
          membership_number,
          first_name,
          last_name,
          phone,
          email,
          address,
          joined_at
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,CURRENT_DATE
        )
        RETURNING *
        `,
        [
          membershipNumber,
          visitor.first_name,
          visitor.last_name,
          visitor.phone,
          visitor.email,
          visitor.address,
        ],
      );

      const member = memberResult.rows[0];

      const convertedResult =
        await client.query(
          `
          UPDATE visitors
          SET
            status = 'CONVERTED',
            converted_member_id = $1,
            converted_at = NOW(),
            follow_up_status = 'COMPLETED',
            updated_at = NOW()
          WHERE id = $2
          RETURNING *
          `,
          [member.id, id],
        );

      await client.query('COMMIT');

      return {
        visitor: convertedResult.rows[0],
        member,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
