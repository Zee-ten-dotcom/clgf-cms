import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { getDatabasePool } from '../database/database-pool';

import { CreateWeeklyServiceDto } from './dto/create-weekly-service.dto';
import { UpdateWeeklyServiceDto } from './dto/update-weekly-service.dto';

@Injectable()
export class WeeklyServicesService {
  private async db() {
    return getDatabasePool().connect();
  }

  async findAll() {
    const client = await this.db();

    try {
      const result = await client.query(`
        SELECT
          id,
          name,
          day_of_week,
          start_time::text,
          end_time::text,
          description,
          status,
          public_visible,
          display_order,
          created_at,
          updated_at
        FROM weekly_services
        ORDER BY display_order ASC, created_at ASC
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
          day_of_week,
          start_time::text,
          end_time::text,
          description,
          display_order
        FROM weekly_services
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
        SELECT *
        FROM weekly_services
        WHERE id = $1
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('Weekly service not found');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async create(body: CreateWeeklyServiceDto) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        INSERT INTO weekly_services (
          name,
          day_of_week,
          start_time,
          end_time,
          description,
          status,
          public_visible,
          display_order
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
        [
          body.name.trim(),
          body.dayOfWeek,
          body.startTime,
          body.endTime || null,
          body.description?.trim() || null,
          body.status || 'ACTIVE',
          body.publicVisible ?? false,
          body.displayOrder ?? 0,
        ],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async update(
    id: string,
    body: UpdateWeeklyServiceDto,
  ) {
    const current = await this.findOne(id);
    const client = await this.db();

    try {
      const result = await client.query(
        `
        UPDATE weekly_services
        SET
          name = $2,
          day_of_week = $3,
          start_time = $4,
          end_time = $5,
          description = $6,
          status = $7,
          public_visible = $8,
          display_order = $9,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
        `,
        [
          id,
          body.name?.trim() ?? current.name,
          body.dayOfWeek ?? current.day_of_week,
          body.startTime ?? current.start_time,
          body.endTime !== undefined
            ? body.endTime || null
            : current.end_time,
          body.description !== undefined
            ? body.description.trim() || null
            : current.description,
          body.status ?? current.status,
          body.publicVisible ?? current.public_visible,
          body.displayOrder ?? current.display_order,
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
        DELETE FROM weekly_services
        WHERE id = $1
        RETURNING *
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('Weekly service not found');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }
}
