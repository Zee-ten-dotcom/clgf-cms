import { BadRequestException, Injectable } from '@nestjs/common';
@Injectable()
export class PastoralCareService {
  private async db() {
    return getDatabasePool().connect();
  }

  async findAll(status?: string, memberId?: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        SELECT
          p.*,
          m.membership_number,
          m.first_name,
          m.last_name,
          leader.first_name AS assigned_leader_first_name,
          leader.last_name AS assigned_leader_last_name
        FROM pastoral_care_records p
        INNER JOIN members m
          ON m.id = p.member_id
        LEFT JOIN members leader
          ON leader.id = p.assigned_leader_id
        WHERE
          ($1::text IS NULL OR p.status = $1)
          AND
          ($2::uuid IS NULL OR p.member_id = $2)
        ORDER BY
          p.follow_up_date ASC NULLS LAST,
          p.care_date DESC,
          p.created_at DESC
        `,
        [
          status?.trim().toUpperCase() || null,
          memberId?.trim() || null,
        ],
      );

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
          p.*,
          m.membership_number,
          m.first_name,
          m.last_name,
          leader.first_name AS assigned_leader_first_name,
          leader.last_name AS assigned_leader_last_name
        FROM pastoral_care_records p
        INNER JOIN members m
          ON m.id = p.member_id
        LEFT JOIN members leader
          ON leader.id = p.assigned_leader_id
        WHERE p.id = $1
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Pastoral care record not found',
        );
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async create(data: {
    memberId: string;
    careType: string;
    subject?: string;
    notes?: string;
    priority?: string;
    status?: string;
    assignedLeaderId?: string;
    careDate?: string;
    followUpDate?: string;
  }) {
    if (!data.memberId) {
      throw new BadRequestException('Member is required');
    }

    if (!data.careType?.trim()) {
      throw new BadRequestException('Care type is required');
    }

    const priority =
      data.priority?.trim().toUpperCase() || 'NORMAL';

    const status =
      data.status?.trim().toUpperCase() || 'OPEN';

    const client = await this.db();

    try {
      const memberResult = await client.query(
        `SELECT id FROM members WHERE id = $1`,
        [data.memberId],
      );

      if (memberResult.rows.length === 0) {
        throw new BadRequestException('Member not found');
      }

      if (data.assignedLeaderId) {
        const leaderResult = await client.query(
          `SELECT id FROM members WHERE id = $1`,
          [data.assignedLeaderId],
        );

        if (leaderResult.rows.length === 0) {
          throw new BadRequestException(
            'Assigned leader not found',
          );
        }
      }

      const result = await client.query(
        `
        INSERT INTO pastoral_care_records (
          member_id,
          care_type,
          subject,
          notes,
          priority,
          status,
          assigned_leader_id,
          care_date,
          follow_up_date
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          COALESCE($8::date, CURRENT_DATE),
          $9
        )
        RETURNING *
        `,
        [
          data.memberId,
          data.careType.trim(),
          data.subject?.trim() || null,
          data.notes?.trim() || null,
          priority,
          status,
          data.assignedLeaderId || null,
          data.careDate?.trim() || null,
          data.followUpDate?.trim() || null,
        ],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async update(
    id: string,
    data: {
      memberId?: string;
      careType?: string;
      subject?: string | null;
      notes?: string | null;
      priority?: string;
      status?: string;
      assignedLeaderId?: string | null;
      careDate?: string;
      followUpDate?: string | null;
    },
  ) {
    const client = await this.db();

    try {
      const existingResult = await client.query(
        `
        SELECT *
        FROM pastoral_care_records
        WHERE id = $1
        `,
        [id],
      );

      if (existingResult.rows.length === 0) {
        throw new BadRequestException(
          'Pastoral care record not found',
        );
      }

      const existing = existingResult.rows[0];

      const memberId =
        data.memberId !== undefined
          ? data.memberId
          : existing.member_id;

      const careType =
        data.careType !== undefined
          ? data.careType.trim()
          : existing.care_type;

      if (!careType) {
        throw new BadRequestException(
          'Care type is required',
        );
      }

      const priority =
        data.priority !== undefined
          ? data.priority.trim().toUpperCase()
          : existing.priority;

      const status =
        data.status !== undefined
          ? data.status.trim().toUpperCase()
          : existing.status;

      const result = await client.query(
        `
        UPDATE pastoral_care_records
        SET
          member_id = $1,
          care_type = $2,
          subject = $3,
          notes = $4,
          priority = $5,
          status = $6,
          assigned_leader_id = $7,
          care_date = $8,
          follow_up_date = $9,
          updated_at = NOW()
        WHERE id = $10
        RETURNING *
        `,
        [
          memberId,
          careType,
          data.subject !== undefined
            ? data.subject?.trim() || null
            : existing.subject,
          data.notes !== undefined
            ? data.notes?.trim() || null
            : existing.notes,
          priority,
          status,
          data.assignedLeaderId !== undefined
            ? data.assignedLeaderId || null
            : existing.assigned_leader_id,
          data.careDate || existing.care_date,
          data.followUpDate !== undefined
            ? data.followUpDate || null
            : existing.follow_up_date,
          id,
        ],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async remove(id: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        DELETE FROM pastoral_care_records
        WHERE id = $1
        RETURNING *
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Pastoral care record not found',
        );
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }
}

import { getDatabasePool } from '../database/database-pool';