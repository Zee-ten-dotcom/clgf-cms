import { BadRequestException, Injectable } from '@nestjs/common';
import { getDatabasePool } from '../database/database-pool';

@Injectable()
export class HomeCellsService {
  private async db() {
    return getDatabasePool().connect();
  }

  async findAll() {
    const client = await this.db();

    try {
      const result = await client.query(`
        SELECT
          h.*,
          CONCAT(m.first_name, ' ', m.last_name) AS leader_name
        FROM home_cells h
        LEFT JOIN members m ON m.id = h.leader_id
        ORDER BY h.display_order ASC, h.created_at DESC
      `);

      return result.rows;
    } finally {
      client.release();
    }
  }

  async findPublic() {
    const client = await this.db();

    try {
      const result = await client.query(`
        SELECT
          id,
          name,
          meeting_day,
          meeting_time
        FROM home_cells
        WHERE status = 'ACTIVE'
          AND public_visible = TRUE
        ORDER BY display_order ASC, created_at ASC
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
          h.*,
          CONCAT(m.first_name, ' ', m.last_name) AS leader_name
        FROM home_cells h
        LEFT JOIN members m ON m.id = h.leader_id
        WHERE h.id = $1
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('Home cell not found');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async create(data: {
    name: string;
    location?: string;
    leaderId?: string | null;
    meetingDay?: string;
    meetingTime?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    publicVisible?: boolean;
    displayOrder?: number;
  }) {
    const client = await this.db();

    try {
      if (!data.name?.trim()) {
        throw new BadRequestException('Home cell name is required');
      }

      const result = await client.query(
        `
        INSERT INTO home_cells (
          name,
          location,
          leader_id,
          meeting_day,
          meeting_time,
          status,
          public_visible,
          display_order
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *
        `,
        [
          data.name.trim(),
          data.location?.trim() || null,
          data.leaderId ?? null,
          data.meetingDay?.trim() || null,
          data.meetingTime?.trim() || null,
          data.status ?? 'ACTIVE',
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
      name?: string;
      location?: string;
      leaderId?: string | null;
      meetingDay?: string;
      meetingTime?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      publicVisible?: boolean;
      displayOrder?: number;
    },
  ) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        UPDATE home_cells
        SET
          name = COALESCE($1, name),
          location = COALESCE($2, location),
          leader_id = COALESCE($3, leader_id),
          meeting_day = COALESCE($4, meeting_day),
          meeting_time = COALESCE($5, meeting_time),
          status = COALESCE($6, status),
          public_visible = COALESCE($7, public_visible),
          display_order = COALESCE($8, display_order)
        WHERE id = $9
        RETURNING *
        `,
        [
          data.name?.trim() || null,
          data.location?.trim() || null,
          data.leaderId ?? null,
          data.meetingDay?.trim() || null,
          data.meetingTime?.trim() || null,
          data.status ?? null,
          data.publicVisible ?? null,
          data.displayOrder ?? null,
          id,
        ],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('Home cell not found');
      }

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
        DELETE FROM home_cells
        WHERE id = $1
        RETURNING *
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('Home cell not found');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }
}
