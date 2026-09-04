import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { getDatabasePool } from '../database/database-pool';

import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementsService {
  private async db() {
    return getDatabasePool().connect();
  }

  async findAll() {
    const client = await this.db();

    try {
      const result = await client.query(`
        SELECT
          id,
          title,
          message,
          announcement_type,
          publish_date::text,
          expiry_date::text,
          status,
          public_visible,
          display_order,
          created_at,
          updated_at
        FROM announcements
        ORDER BY display_order ASC, publish_date DESC, created_at DESC
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
          title,
          message,
          announcement_type,
          publish_date::text,
          expiry_date::text,
          display_order
        FROM announcements
        WHERE status = 'PUBLISHED'
          AND public_visible = TRUE
          AND publish_date <= CURRENT_DATE
          AND (
            expiry_date IS NULL
            OR expiry_date >= CURRENT_DATE
          )
        ORDER BY display_order ASC, publish_date DESC, created_at DESC
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
          id,
          title,
          message,
          announcement_type,
          publish_date::text,
          expiry_date::text,
          status,
          public_visible,
          display_order,
          created_at,
          updated_at
        FROM announcements
        WHERE id = $1
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('Announcement not found');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async create(body: CreateAnnouncementDto) {
    const client = await this.db();

    try {
      if (
        body.expiryDate &&
        body.expiryDate < body.publishDate
      ) {
        throw new BadRequestException(
          'Expiry date cannot be before publish date',
        );
      }

      const result = await client.query(
        `
        INSERT INTO announcements (
          title,
          message,
          announcement_type,
          publish_date,
          expiry_date,
          status,
          public_visible,
          display_order
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
          id,
          title,
          message,
          announcement_type,
          publish_date::text,
          expiry_date::text,
          status,
          public_visible,
          display_order,
          created_at,
          updated_at
        `,
        [
          body.title.trim(),
          body.message.trim(),
          body.announcementType?.trim() || 'GENERAL',
          body.publishDate,
          body.expiryDate || null,
          body.status || 'DRAFT',
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
    body: UpdateAnnouncementDto,
  ) {
    const current = await this.findOne(id);

    const publishDate =
      body.publishDate ?? current.publish_date;

    const expiryDate =
      body.expiryDate !== undefined
        ? body.expiryDate || null
        : current.expiry_date;

    if (
      expiryDate &&
      expiryDate < publishDate
    ) {
      throw new BadRequestException(
        'Expiry date cannot be before publish date',
      );
    }

    const client = await this.db();

    try {
      const result = await client.query(
        `
        UPDATE announcements
        SET
          title = $2,
          message = $3,
          announcement_type = $4,
          publish_date = $5,
          expiry_date = $6,
          status = $7,
          public_visible = $8,
          display_order = $9,
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          title,
          message,
          announcement_type,
          publish_date::text,
          expiry_date::text,
          status,
          public_visible,
          display_order,
          created_at,
          updated_at
        `,
        [
          id,
          body.title?.trim() ?? current.title,
          body.message?.trim() ?? current.message,
          body.announcementType !== undefined
            ? body.announcementType.trim() || 'GENERAL'
            : current.announcement_type,
          publishDate,
          expiryDate,
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
        DELETE FROM announcements
        WHERE id = $1
        RETURNING
          id,
          title,
          announcement_type,
          publish_date::text,
          expiry_date::text,
          status,
          public_visible,
          display_order
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('Announcement not found');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }
}
