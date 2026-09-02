import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { getDatabasePool } from '../database/database-pool';

@Injectable()
export class SermonsService {
  private async db() {
    return getDatabasePool().connect();
  }

  private normalizeSermonRow(row: any) {
    const {
      sermon_date_text,
      ...rest
    } = row;

    return {
      ...rest,
      sermon_date:
        sermon_date_text ?? row.sermon_date,
    };
  }

  async findAll() {
    const client = await this.db();

    try {
      const result = await client.query(`
        SELECT
          *,
          sermon_date::text AS sermon_date_text
        FROM sermons
        ORDER BY
          featured DESC,
          sermon_date DESC,
          created_at DESC
      `);

      return result.rows.map((row) =>
        this.normalizeSermonRow(row),
      );
    } finally {
      client.release();
    }
  }

  async findPublished() {
    const client = await this.db();

    try {
      const result = await client.query(`
        SELECT
          id,
          title,
          speaker,
          scripture,
          sermon_date::text AS sermon_date,
          description,
          video_url,
          audio_url,
          notes_url,
          featured
        FROM sermons
        WHERE status = 'PUBLISHED'
        ORDER BY
          featured DESC,
          sermon_date DESC,
          created_at DESC
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
          *,
          sermon_date::text AS sermon_date_text
        FROM sermons
        WHERE id = $1
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Sermon not found',
        );
      }

      return this.normalizeSermonRow(
        result.rows[0],
      );
    } finally {
      client.release();
    }
  }

  async create(data: {
    title: string;
    speaker: string;
    scripture?: string;
    sermonDate: string;
    description?: string;
    videoUrl?: string;
    audioUrl?: string;
    notesUrl?: string;
    status?: string;
    featured?: boolean;
  }) {
    const title = data.title?.trim();
    const speaker = data.speaker?.trim();

    if (!title) {
      throw new BadRequestException(
        'Sermon title is required',
      );
    }

    if (!speaker) {
      throw new BadRequestException(
        'Sermon speaker is required',
      );
    }

    if (!data.sermonDate) {
      throw new BadRequestException(
        'Sermon date is required',
      );
    }

    const status =
      data.status?.trim().toUpperCase() ||
      'DRAFT';

    const client = await this.db();

    try {
      const result = await client.query(
        `
        INSERT INTO sermons (
          title,
          speaker,
          scripture,
          sermon_date,
          description,
          video_url,
          audio_url,
          notes_url,
          status,
          featured
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
        )
        RETURNING
          *,
          sermon_date::text AS sermon_date_text
        `,
        [
          title,
          speaker,
          data.scripture?.trim() || null,
          data.sermonDate,
          data.description?.trim() || null,
          data.videoUrl?.trim() || null,
          data.audioUrl?.trim() || null,
          data.notesUrl?.trim() || null,
          status,
          data.featured ?? false,
        ],
      );

      return this.normalizeSermonRow(
        result.rows[0],
      );
    } finally {
      client.release();
    }
  }

  async update(
    id: string,
    data: {
      title?: string;
      speaker?: string;
      scripture?: string | null;
      sermonDate?: string;
      description?: string | null;
      videoUrl?: string | null;
      audioUrl?: string | null;
      notesUrl?: string | null;
      status?: string;
      featured?: boolean;
    },
  ) {
    const client = await this.db();

    try {
      const existingResult =
        await client.query(
          `
          SELECT *
          FROM sermons
          WHERE id = $1
          `,
          [id],
        );

      if (existingResult.rows.length === 0) {
        throw new BadRequestException(
          'Sermon not found',
        );
      }

      const existing =
        existingResult.rows[0];

      const title =
        data.title !== undefined
          ? data.title.trim()
          : existing.title;

      const speaker =
        data.speaker !== undefined
          ? data.speaker.trim()
          : existing.speaker;

      if (!title) {
        throw new BadRequestException(
          'Sermon title is required',
        );
      }

      if (!speaker) {
        throw new BadRequestException(
          'Sermon speaker is required',
        );
      }

      const status =
        data.status !== undefined
          ? data.status.trim().toUpperCase()
          : existing.status;

      const result = await client.query(
        `
        UPDATE sermons
        SET
          title = $1,
          speaker = $2,
          scripture = $3,
          sermon_date = $4,
          description = $5,
          video_url = $6,
          audio_url = $7,
          notes_url = $8,
          status = $9,
          featured = $10,
          updated_at = NOW()
        WHERE id = $11
        RETURNING
          *,
          sermon_date::text AS sermon_date_text
        `,
        [
          title,
          speaker,
          data.scripture !== undefined
            ? data.scripture?.trim() || null
            : existing.scripture,
          data.sermonDate ||
            existing.sermon_date_text,
          data.description !== undefined
            ? data.description?.trim() || null
            : existing.description,
          data.videoUrl !== undefined
            ? data.videoUrl?.trim() || null
            : existing.video_url,
          data.audioUrl !== undefined
            ? data.audioUrl?.trim() || null
            : existing.audio_url,
          data.notesUrl !== undefined
            ? data.notesUrl?.trim() || null
            : existing.notes_url,
          status,
          data.featured !== undefined
            ? data.featured
            : existing.featured,
          id,
        ],
      );

      return this.normalizeSermonRow(
        result.rows[0],
      );
    } finally {
      client.release();
    }
  }

  async remove(id: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        DELETE FROM sermons
        WHERE id = $1
        RETURNING
          *,
          sermon_date::text AS sermon_date_text
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Sermon not found',
        );
      }

      return this.normalizeSermonRow(
        result.rows[0],
      );
    } finally {
      client.release();
    }
  }
}
