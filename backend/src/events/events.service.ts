import { BadRequestException, Injectable } from '@nestjs/common';
@Injectable()
export class EventsService {
  private async db() {
    return getDatabasePool().connect();
  }

  async findAll(from?: string, to?: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        SELECT *
        FROM events
        WHERE
          ($1::date IS NULL OR event_date >= $1::date)
          AND
          ($2::date IS NULL OR event_date <= $2::date)
        ORDER BY event_date ASC, start_time ASC, created_at ASC
        `,
        [
          from?.trim() || null,
          to?.trim() || null,
        ],
      );

      return result.rows;
    } finally {
      client.release();
    }
  }

  async findPublicUpcoming() {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        SELECT
          id,
          title,
          description,
          event_date,
          start_time,
          end_time,
          location,
          event_type
        FROM events
        WHERE
          event_date >= CURRENT_DATE
          AND UPPER(status) = 'SCHEDULED'
        ORDER BY event_date ASC, start_time ASC, created_at ASC
        `,
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
        SELECT *
        FROM events
        WHERE id = $1
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('Event not found');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async create(data: {
    title: string;
    description?: string;
    eventDate: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    eventType?: string;
    status?: string;
    attendanceSessionId?: string;
  }) {
    if (!data.title?.trim()) {
      throw new BadRequestException('Event title is required');
    }

    if (!data.eventDate) {
      throw new BadRequestException('Event date is required');
    }

    const status =
      data.status?.trim().toUpperCase() || 'SCHEDULED';

    const client = await this.db();

    try {
      const result = await client.query(
        `
        INSERT INTO events (
          title,
          description,
          event_date,
          start_time,
          end_time,
          location,
          event_type,
          status,
          attendance_session_id
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *
        `,
        [
          data.title.trim(),
          data.description?.trim() || null,
          data.eventDate,
          data.startTime || null,
          data.endTime || null,
          data.location?.trim() || null,
          data.eventType?.trim() || null,
          status,
          data.attendanceSessionId || null,
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
      title?: string;
      description?: string | null;
      eventDate?: string;
      startTime?: string | null;
      endTime?: string | null;
      location?: string | null;
      eventType?: string | null;
      status?: string;
      attendanceSessionId?: string | null;
    },
  ) {
    const client = await this.db();

    try {
      const existingResult = await client.query(
        `SELECT * FROM events WHERE id = $1`,
        [id],
      );

      if (existingResult.rows.length === 0) {
        throw new BadRequestException('Event not found');
      }

      const existing = existingResult.rows[0];

      const title =
        data.title !== undefined
          ? data.title.trim()
          : existing.title;

      if (!title) {
        throw new BadRequestException('Event title is required');
      }

      const status =
        data.status !== undefined
          ? data.status.trim().toUpperCase()
          : existing.status;

      const result = await client.query(
        `
        UPDATE events
        SET
          title = $1,
          description = $2,
          event_date = $3,
          start_time = $4,
          end_time = $5,
          location = $6,
          event_type = $7,
          status = $8,
          attendance_session_id = $9,
          updated_at = NOW()
        WHERE id = $10
        RETURNING *
        `,
        [
          title,
          data.description !== undefined
            ? data.description?.trim() || null
            : existing.description,
          data.eventDate || existing.event_date,
          data.startTime !== undefined
            ? data.startTime || null
            : existing.start_time,
          data.endTime !== undefined
            ? data.endTime || null
            : existing.end_time,
          data.location !== undefined
            ? data.location?.trim() || null
            : existing.location,
          data.eventType !== undefined
            ? data.eventType?.trim() || null
            : existing.event_type,
          status,
          data.attendanceSessionId !== undefined
            ? data.attendanceSessionId || null
            : existing.attendance_session_id,
          id,
        ],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async createOrGetAttendanceSession(id: string) {
    const client = await this.db();

    try {
      await client.query('BEGIN');

      const eventResult = await client.query(
        `
        SELECT *
        FROM events
        WHERE id = $1
        FOR UPDATE
        `,
        [id],
      );

      if (eventResult.rows.length === 0) {
        throw new BadRequestException('Event not found');
      }

      const event = eventResult.rows[0];

      if (event.attendance_session_id) {
        const existingSession = await client.query(
          `
          SELECT *
          FROM attendance_sessions
          WHERE id = $1
          `,
          [event.attendance_session_id],
        );

        if (existingSession.rows.length > 0) {
          await client.query('COMMIT');

          return {
            created: false,
            event,
            attendanceSession: existingSession.rows[0],
          };
        }
      }

      const sessionResult = await client.query(
        `
        INSERT INTO attendance_sessions (
          service_date,
          service_type,
          notes
        )
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [
          event.event_date,
          event.title,
          event.description || null,
        ],
      );

      const attendanceSession =
        sessionResult.rows[0];

      const updatedEventResult = await client.query(
        `
        UPDATE events
        SET
          attendance_session_id = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
        `,
        [
          attendanceSession.id,
          id,
        ],
      );

      await client.query('COMMIT');

      return {
        created: true,
        event: updatedEventResult.rows[0],
        attendanceSession,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async remove(id: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        DELETE FROM events
        WHERE id = $1
        RETURNING *
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('Event not found');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }
}

import { getDatabasePool } from '../database/database-pool';