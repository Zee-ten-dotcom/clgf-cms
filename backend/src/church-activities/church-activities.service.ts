import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { getDatabasePool } from '../database/database-pool';

@Injectable()
export class ChurchActivitiesService {
  private async db() {
    return getDatabasePool().connect();
  }

  private normalizeActivityRow(row: any) {
    const {
      activity_date_text,
      ...rest
    } = row;

    return {
      ...rest,
      activity_date:
        activity_date_text ?? row.activity_date,
    };
  }

  private async mediaForActivity(
    client: any,
    activityId: string,
  ) {
    const result = await client.query(
      `
      SELECT
        id,
        activity_id,
        media_type,
        media_url,
        cloudinary_public_id,
        caption,
        display_order,
        created_at
      FROM church_activity_media
      WHERE activity_id = $1
      ORDER BY
        display_order ASC,
        created_at ASC
      `,
      [activityId],
    );

    return result.rows;
  }

  private async publicMediaForActivity(
    client: any,
    activityId: string,
  ) {
    const result = await client.query(
      `
      SELECT
        id,
        activity_id,
        media_type,
        media_url,
        caption,
        display_order,
        created_at
      FROM church_activity_media
      WHERE activity_id = $1
      ORDER BY
        display_order ASC,
        created_at ASC
      `,
      [activityId],
    );

    return result.rows;
  }


  async findAll() {
    const client = await this.db();

    try {
      const result = await client.query(`
        SELECT
          *,
          activity_date::text AS activity_date_text
        FROM church_activities
        ORDER BY
          featured DESC,
          display_order ASC,
          activity_date DESC,
          created_at DESC
      `);

      const activities: any[] = [];

      for (const row of result.rows) {
        const activity =
          this.normalizeActivityRow(row);

        activity.media =
          await this.mediaForActivity(
            client,
            activity.id,
          );

        activities.push(activity);
      }

      return activities;
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
          activity_date::text AS activity_date,
          description,
          featured,
          display_order,
          created_at
        FROM church_activities
        WHERE status = 'PUBLISHED'
        ORDER BY
          featured DESC,
          display_order ASC,
          activity_date DESC,
          created_at DESC
      `);

      const activities: any[] = [];

      for (const activity of result.rows) {
        activity.media =
          await this.publicMediaForActivity(
            client,
            activity.id,
          );

        activities.push(activity);
      }

      return activities;
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
          activity_date::text AS activity_date_text
        FROM church_activities
        WHERE id = $1
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Church activity not found',
        );
      }

      const activity =
        this.normalizeActivityRow(
          result.rows[0],
        );

      activity.media =
        await this.mediaForActivity(
          client,
          activity.id,
        );

      return activity;
    } finally {
      client.release();
    }
  }

  async findPublishedOne(id: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        SELECT
          id,
          title,
          activity_date::text AS activity_date,
          description,
          featured,
          display_order,
          created_at
        FROM church_activities
        WHERE id = $1
          AND status = 'PUBLISHED'
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Church activity not found',
        );
      }

      const activity = result.rows[0];

      activity.media =
        await this.publicMediaForActivity(
          client,
          activity.id,
        );

      return activity;
    } finally {
      client.release();
    }
  }

  async create(data: {
    title: string;
    activityDate: string;
    description?: string;
    status?: string;
    featured?: boolean;
    displayOrder?: number;
  }) {
    const title = data.title?.trim();

    if (!title) {
      throw new BadRequestException(
        'Activity title is required',
      );
    }

    if (!data.activityDate) {
      throw new BadRequestException(
        'Activity date is required',
      );
    }

    const status =
      data.status?.trim().toUpperCase() ||
      'DRAFT';

    const client = await this.db();

    try {
      const result = await client.query(
        `
        INSERT INTO church_activities (
          title,
          activity_date,
          description,
          status,
          featured,
          display_order
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING
          *,
          activity_date::text AS activity_date_text
        `,
        [
          title,
          data.activityDate,
          data.description?.trim() || null,
          status,
          data.featured ?? false,
          data.displayOrder ?? 0,
        ],
      );

      const activity =
        this.normalizeActivityRow(
          result.rows[0],
        );

      activity.media = [];

      return activity;
    } finally {
      client.release();
    }
  }

  async update(
    id: string,
    data: {
      title?: string;
      activityDate?: string;
      description?: string;
      status?: string;
      featured?: boolean;
      displayOrder?: number;
    },
  ) {
    const client = await this.db();

    try {
      const existingResult =
        await client.query(
          `
          SELECT
            *,
            activity_date::text AS activity_date_text
          FROM church_activities
          WHERE id = $1
          `,
          [id],
        );

      if (existingResult.rows.length === 0) {
        throw new BadRequestException(
          'Church activity not found',
        );
      }

      const existing =
        existingResult.rows[0];

      const title =
        data.title !== undefined
          ? data.title.trim()
          : existing.title;

      if (!title) {
        throw new BadRequestException(
          'Activity title is required',
        );
      }

      const status =
        data.status !== undefined
          ? data.status.trim().toUpperCase()
          : existing.status;

      const result = await client.query(
        `
        UPDATE church_activities
        SET
          title = $1,
          activity_date = $2,
          description = $3,
          status = $4,
          featured = $5,
          display_order = $6,
          updated_at = NOW()
        WHERE id = $7
        RETURNING
          *,
          activity_date::text AS activity_date_text
        `,
        [
          title,
          data.activityDate ||
            existing.activity_date_text,
          data.description !== undefined
            ? data.description?.trim() || null
            : existing.description,
          status,
          data.featured !== undefined
            ? data.featured
            : existing.featured,
          data.displayOrder !== undefined
            ? data.displayOrder
            : existing.display_order,
          id,
        ],
      );

      const activity =
        this.normalizeActivityRow(
          result.rows[0],
        );

      activity.media =
        await this.mediaForActivity(
          client,
          activity.id,
        );

      return activity;
    } finally {
      client.release();
    }
  }

  async addMedia(data: {
    activityId: string;
    mediaType: 'PHOTO' | 'VIDEO';
    mediaUrl: string;
    cloudinaryPublicId: string;
    caption?: string;
    displayOrder?: number;
  }) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        INSERT INTO church_activity_media (
          activity_id,
          media_type,
          media_url,
          cloudinary_public_id,
          caption,
          display_order
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *
        `,
        [
          data.activityId,
          data.mediaType,
          data.mediaUrl,
          data.cloudinaryPublicId,
          data.caption?.trim() || null,
          data.displayOrder ?? 0,
        ],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async findMedia(mediaId: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        SELECT *
        FROM church_activity_media
        WHERE id = $1
        `,
        [mediaId],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Activity media not found',
        );
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updateMedia(
    mediaId: string,
    data: {
      caption?: string;
      displayOrder?: number;
    },
  ) {
    const client = await this.db();

    try {
      const existingResult =
        await client.query(
          `
          SELECT *
          FROM church_activity_media
          WHERE id = $1
          `,
          [mediaId],
        );

      if (existingResult.rows.length === 0) {
        throw new BadRequestException(
          'Activity media not found',
        );
      }

      const existing =
        existingResult.rows[0];

      const result = await client.query(
        `
        UPDATE church_activity_media
        SET
          caption = $1,
          display_order = $2
        WHERE id = $3
        RETURNING *
        `,
        [
          data.caption !== undefined
            ? data.caption?.trim() || null
            : existing.caption,
          data.displayOrder !== undefined
            ? data.displayOrder
            : existing.display_order,
          mediaId,
        ],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async removeMediaRecord(mediaId: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        DELETE FROM church_activity_media
        WHERE id = $1
        RETURNING *
        `,
        [mediaId],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Activity media not found',
        );
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
        DELETE FROM church_activities
        WHERE id = $1
        RETURNING
          *,
          activity_date::text AS activity_date_text
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Church activity not found',
        );
      }

      return this.normalizeActivityRow(
        result.rows[0],
      );
    } finally {
      client.release();
    }
  }
}
