import { BadRequestException, Injectable } from '@nestjs/common';
@Injectable()
export class LeadershipService {
  private async db() {
    return getDatabasePool().connect();
  }

  async findAll(
    status?: string,
    memberId?: string,
    ministryId?: string,
  ) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        SELECT
          l.*,
          m.membership_number,
          m.first_name,
          m.last_name,
          min.name AS ministry_name
        FROM leadership_assignments l
        INNER JOIN members m
          ON m.id = l.member_id
        LEFT JOIN ministries min
          ON min.id = l.ministry_id
        WHERE
          ($1::text IS NULL OR l.status = $1)
          AND ($2::uuid IS NULL OR l.member_id = $2)
          AND ($3::uuid IS NULL OR l.ministry_id = $3)
        ORDER BY
          l.status,
          l.role_title,
          m.first_name,
          m.last_name
        `,
        [
          status?.trim().toUpperCase() || null,
          memberId?.trim() || null,
          ministryId?.trim() || null,
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
          l.*,
          m.membership_number,
          m.first_name,
          m.last_name,
          min.name AS ministry_name
        FROM leadership_assignments l
        INNER JOIN members m
          ON m.id = l.member_id
        LEFT JOIN ministries min
          ON min.id = l.ministry_id
        WHERE l.id = $1
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Leadership assignment not found',
        );
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async create(data: {
    memberId: string;
    ministryId?: string;
    roleTitle: string;
    roleType?: string;
    responsibility?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    publicVisible?: boolean;
    displayOrder?: number;
  }) {
    if (!data.memberId) {
      throw new BadRequestException('Member is required');
    }

    if (!data.roleTitle?.trim()) {
      throw new BadRequestException('Role title is required');
    }

    const client = await this.db();

    try {
      const memberResult = await client.query(
        `SELECT id FROM members WHERE id = $1`,
        [data.memberId],
      );

      if (memberResult.rows.length === 0) {
        throw new BadRequestException('Member not found');
      }

      if (data.ministryId) {
        const ministryResult = await client.query(
          `SELECT id FROM ministries WHERE id = $1`,
          [data.ministryId],
        );

        if (ministryResult.rows.length === 0) {
          throw new BadRequestException('Ministry not found');
        }
      }

      const result = await client.query(
        `
        INSERT INTO leadership_assignments (
          member_id,
          ministry_id,
          role_title,
          role_type,
          responsibility,
          status,
          start_date,
          end_date,
          public_visible,
          display_order
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
        `,
        [
          data.memberId,
          data.ministryId || null,
          data.roleTitle.trim(),
          data.roleType?.trim().toUpperCase() || 'MINISTRY',
          data.responsibility?.trim() || null,
          data.status?.trim().toUpperCase() || 'ACTIVE',
          data.startDate || null,
          data.endDate || null,
          data.publicVisible ?? false,
          data.displayOrder ?? 0,
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
      ministryId?: string | null;
      roleTitle?: string;
      roleType?: string;
      responsibility?: string | null;
      status?: string;
      startDate?: string | null;
      endDate?: string | null;
      publicVisible?: boolean;
      displayOrder?: number;
    },
  ) {
    const client = await this.db();

    try {
      const existingResult = await client.query(
        `
        SELECT *
        FROM leadership_assignments
        WHERE id = $1
        `,
        [id],
      );

      if (existingResult.rows.length === 0) {
        throw new BadRequestException(
          'Leadership assignment not found',
        );
      }

      const existing = existingResult.rows[0];

      const result = await client.query(
        `
        UPDATE leadership_assignments
        SET
          member_id = $1,
          ministry_id = $2,
          role_title = $3,
          role_type = $4,
          responsibility = $5,
          status = $6,
          start_date = $7,
          end_date = $8,
          public_visible = $9,
          display_order = $10,
          updated_at = NOW()
        WHERE id = $11
        RETURNING *
        `,
        [
          data.memberId || existing.member_id,
          data.ministryId !== undefined
            ? data.ministryId || null
            : existing.ministry_id,
          data.roleTitle !== undefined
            ? data.roleTitle.trim()
            : existing.role_title,
          data.roleType !== undefined
            ? data.roleType.trim().toUpperCase()
            : existing.role_type,
          data.responsibility !== undefined
            ? data.responsibility?.trim() || null
            : existing.responsibility,
          data.status !== undefined
            ? data.status.trim().toUpperCase()
            : existing.status,
          data.startDate !== undefined
            ? data.startDate || null
            : existing.start_date,
          data.endDate !== undefined
            ? data.endDate || null
            : existing.end_date,
          data.publicVisible !== undefined
            ? data.publicVisible
            : existing.public_visible,
          data.displayOrder !== undefined
            ? data.displayOrder
            : existing.display_order,
          id,
        ],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updatePhotoUrl(
    id: string,
    photoUrl: string | null,
  ) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        UPDATE leadership_assignments
        SET
          photo_url = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
        `,
        [photoUrl, id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Leadership assignment not found',
        );
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async findPublic() {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        SELECT
          l.id,
          m.first_name,
          m.last_name,
          l.role_title,
          l.role_type,
          l.responsibility,
          min.name AS ministry_name,
          l.photo_url,
          l.display_order
        FROM leadership_assignments l
        INNER JOIN members m
          ON m.id = l.member_id
        LEFT JOIN ministries min
          ON min.id = l.ministry_id
        WHERE
          l.status = 'ACTIVE'
          AND l.public_visible = TRUE
        ORDER BY
          l.display_order,
          l.role_title,
          m.first_name,
          m.last_name
        `,
      );

      return result.rows;
    } finally {
      client.release();
    }
  }

  async remove(id: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        DELETE FROM leadership_assignments
        WHERE id = $1
        RETURNING *
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Leadership assignment not found',
        );
      }

      return {
        message: 'Leadership assignment deleted successfully',
        assignment: result.rows[0],
      };
    } finally {
      client.release();
    }
  }
}

import { getDatabasePool } from '../database/database-pool';