import { Injectable } from '@nestjs/common';
export type AuditActor = {
  sub?: string;
  email?: string;
  role?: string;
};

export type CreateAuditLog = {
  actor?: AuditActor;

  action: string;
  module: string;

  entityType?: string;
  entityId?: string | null;

  description?: string;

  metadata?: Record<string, unknown> | null;
};

export type AuditFilters = {
  module?: string;
  action?: string;
  userId?: string;

  from?: string;
  to?: string;

  search?: string;

  limit?: number;
  offset?: number;
};

@Injectable()
export class AuditService {
  private async db() {
    return getDatabasePool().connect();
  }

  async log(data: CreateAuditLog) {
    const client = await this.db();

    try {
      let actorName: string | null = null;
      let actorEmail: string | null =
        data.actor?.email || null;
      let actorRole: string | null =
        data.actor?.role || null;

      const userId = data.actor?.sub || null;

      if (userId) {
        const userResult = await client.query(
          `
          SELECT
            first_name,
            last_name,
            email,
            role
          FROM users
          WHERE id = $1
          LIMIT 1
          `,
          [userId],
        );

        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];

          actorName =
            `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
            null;

          actorEmail =
            user.email || actorEmail;

          actorRole =
            user.role || actorRole;
        }
      }

      const result = await client.query(
        `
        INSERT INTO audit_logs (
          user_id,
          actor_email,
          actor_name,
          actor_role,
          action,
          module,
          entity_type,
          entity_id,
          description,
          metadata
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10
        )
        RETURNING *
        `,
        [
          userId,
          actorEmail,
          actorName,
          actorRole,
          data.action.trim().toUpperCase(),
          data.module.trim().toUpperCase(),
          data.entityType?.trim() || null,
          data.entityId || null,
          data.description?.trim() || null,
          data.metadata
            ? JSON.stringify(data.metadata)
            : null,
        ],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async findAll(filters: AuditFilters = {}) {
    const client = await this.db();

    try {
      const conditions: string[] = [];
      const values: unknown[] = [];

      const addValue = (value: unknown) => {
        values.push(value);
        return `$${values.length}`;
      };

      if (filters.module?.trim()) {
        const parameter = addValue(
          filters.module.trim().toUpperCase(),
        );

        conditions.push(
          `module = ${parameter}`,
        );
      }

      if (filters.action?.trim()) {
        const parameter = addValue(
          filters.action.trim().toUpperCase(),
        );

        conditions.push(
          `action = ${parameter}`,
        );
      }

      if (filters.userId?.trim()) {
        const parameter = addValue(
          filters.userId.trim(),
        );

        conditions.push(
          `user_id = ${parameter}`,
        );
      }

      if (filters.from?.trim()) {
        const parameter = addValue(
          filters.from.trim(),
        );

        conditions.push(
          `created_at >= ${parameter}::date`,
        );
      }

      if (filters.to?.trim()) {
        const parameter = addValue(
          filters.to.trim(),
        );

        conditions.push(
          `created_at < (${parameter}::date + INTERVAL '1 day')`,
        );
      }

      if (filters.search?.trim()) {
        const parameter = addValue(
          `%${filters.search.trim()}%`,
        );

        conditions.push(`
          (
            actor_name ILIKE ${parameter}
            OR actor_email ILIKE ${parameter}
            OR description ILIKE ${parameter}
            OR module ILIKE ${parameter}
            OR action ILIKE ${parameter}
            OR entity_type ILIKE ${parameter}
          )
        `);
      }

      const requestedLimit = Number(
        filters.limit || 100,
      );

      const requestedOffset = Number(
        filters.offset || 0,
      );

      const limit = Math.min(
        Math.max(
          Number.isFinite(requestedLimit)
            ? requestedLimit
            : 100,
          1,
        ),
        500,
      );

      const offset = Math.max(
        Number.isFinite(requestedOffset)
          ? requestedOffset
          : 0,
        0,
      );

      const where =
        conditions.length > 0
          ? `WHERE ${conditions.join(' AND ')}`
          : '';

      const limitParameter =
        addValue(limit);

      const offsetParameter =
        addValue(offset);

      const result = await client.query(
        `
        SELECT
          id,
          user_id,
          actor_email,
          actor_name,
          actor_role,
          action,
          module,
          entity_type,
          entity_id,
          description,
          metadata,
          created_at
        FROM audit_logs
        ${where}
        ORDER BY created_at DESC
        LIMIT ${limitParameter}
        OFFSET ${offsetParameter}
        `,
        values,
      );

      return result.rows;
    } finally {
      client.release();
    }
  }

  async summary() {
    const client = await this.db();

    try {
      const result = await client.query(`
        SELECT
          COUNT(*)::int AS total_logs,

          COUNT(*) FILTER (
            WHERE created_at >= CURRENT_DATE
          )::int AS today_logs,

          COUNT(*) FILTER (
            WHERE created_at >=
              CURRENT_DATE - INTERVAL '7 days'
          )::int AS last_7_days,

          COUNT(DISTINCT user_id) FILTER (
            WHERE user_id IS NOT NULL
          )::int AS active_users
        FROM audit_logs
      `);

      return result.rows[0];
    } finally {
      client.release();
    }
  }
}

import { getDatabasePool } from '../database/database-pool';