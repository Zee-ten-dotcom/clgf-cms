import { Injectable, BadRequestException } from '@nestjs/common';
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
        ORDER BY m.created_at DESC
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
  }) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        INSERT INTO ministries (
          name,
          description,
          leader_id
        )
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [
          data.name.trim(),
          data.description?.trim() || null,
          data.leaderId || null,
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
          created_at = created_at
        WHERE id = $4
        RETURNING *
        `,
        [
          data.name?.trim() || null,
          data.description?.trim() || null,
          data.leaderId ?? null,
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

import { getDatabasePool } from '../database/database-pool';