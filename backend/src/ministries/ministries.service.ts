import { BadRequestException, Injectable } from '@nestjs/common';
import { getDatabasePool } from '../database/database-pool';

@Injectable()
export class MinistriesService {
  private async db() {
    return getDatabasePool().connect();
  }

  async findAll() {
    const client = await this.db();

    try {
      const result = await client.query(`
        SELECT
          m.*,
          CONCAT(mem.first_name, ' ', mem.last_name) AS leader_name
        FROM ministries m
        LEFT JOIN members mem ON mem.id = m.leader_id
        ORDER BY m.display_order ASC, m.created_at ASC
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
          description
        FROM ministries
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
          m.*,
          CONCAT(mem.first_name, ' ', mem.last_name) AS leader_name
        FROM ministries m
        LEFT JOIN members mem ON mem.id = m.leader_id
        WHERE m.id = $1
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('Ministry not found');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async create(data: {
    name: string;
    description?: string | null;
    leaderId?: string | null;
    status?: 'ACTIVE' | 'INACTIVE';
    publicVisible?: boolean;
    displayOrder?: number;
  }) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        INSERT INTO ministries (
          name,
          description,
          leader_id,
          status,
          public_visible,
          display_order
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
          data.name.trim(),
          data.description?.trim() || null,
          data.leaderId || null,
          data.status || 'ACTIVE',
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
      description?: string | null;
      leaderId?: string | null;
      status?: 'ACTIVE' | 'INACTIVE';
      publicVisible?: boolean;
      displayOrder?: number;
    },
  ) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        UPDATE ministries
        SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          leader_id = COALESCE($3, leader_id),
          status = COALESCE($4, status),
          public_visible = COALESCE($5, public_visible),
          display_order = COALESCE($6, display_order)
        WHERE id = $7
        RETURNING *
        `,
        [
          data.name?.trim() || null,
          data.description?.trim() || null,
          data.leaderId ?? null,
          data.status ?? null,
          data.publicVisible ?? null,
          data.displayOrder ?? null,
          id,
        ],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('Ministry not found');
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
        DELETE FROM ministries
        WHERE id = $1
        RETURNING *
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('Ministry not found');
      }

      return {
        message: 'Ministry deleted successfully',
        ministry: result.rows[0],
      };
    } finally {
      client.release();
    }
  }
}
