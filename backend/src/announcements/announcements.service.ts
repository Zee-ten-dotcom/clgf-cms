import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { getDatabasePool } from '../database/database-pool';
import { PushNotificationsService } from '../push-notifications/push-notifications.service';

import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly pushNotificationsService:
      PushNotificationsService,
  ) {}

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
          notification_target,
          target_home_cell_id,
          target_member_ids,
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
          notification_target,
          target_home_cell_id,
          target_member_ids,
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


  async findForRecipient(id: string, userId: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        SELECT a.id, a.title, a.message,
               a.announcement_type,
               a.publish_date::text,
               a.expiry_date::text, a.status
        FROM announcements a
        JOIN users u ON u.id = $2
        LEFT JOIN members m ON m.id = u.member_id
        WHERE a.id = $1
          AND a.status = 'PUBLISHED'
          AND a.publish_date <= CURRENT_DATE
          AND (a.expiry_date IS NULL
               OR a.expiry_date >= CURRENT_DATE)
          AND u.is_active = TRUE
          AND (
            a.notification_target = 'EVERYONE'
            OR (a.notification_target = 'LEADERS'
                AND u.role IN ('ADMIN', 'LEADER'))
            OR (a.notification_target = 'HOME_CELL'
                AND m.home_cell_id = a.target_home_cell_id)
            OR (a.notification_target = 'SELECTED_MEMBERS'
                AND u.member_id = ANY(a.target_member_ids))
          )
        `,
        [id, userId],
      );

      if (!result.rows.length) {
        throw new BadRequestException(
          'Announcement unavailable or access denied',
        );
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
          display_order,
          notification_target,
          target_home_cell_id,
          target_member_ids
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11
        )
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
          notification_target,
          target_home_cell_id,
          target_member_ids,
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
          body.notificationTarget || 'EVERYONE',
          body.notificationTarget === 'HOME_CELL'
            ? body.targetHomeCellId || null
            : null,
          body.notificationTarget === 'SELECTED_MEMBERS'
            ? body.targetMemberIds || []
            : [],
        ],
      );

      const announcement = result.rows[0];

            return announcement;
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
          notification_target = $10,
          target_home_cell_id = $11,
          target_member_ids = $12,
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
          notification_target,
          target_home_cell_id,
          target_member_ids,
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
          body.notificationTarget ??
            current.notification_target ??
            'EVERYONE',
          (body.notificationTarget ??
            current.notification_target) === 'HOME_CELL'
            ? (
                body.targetHomeCellId !== undefined
                  ? body.targetHomeCellId || null
                  : current.target_home_cell_id
              )
            : null,
          (body.notificationTarget ??
            current.notification_target) ===
          'SELECTED_MEMBERS'
            ? (
                body.targetMemberIds !== undefined
                  ? body.targetMemberIds
                  : current.target_member_ids || []
              )
            : [],
        ],
      );

      const announcement = result.rows[0];

            return announcement;
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
