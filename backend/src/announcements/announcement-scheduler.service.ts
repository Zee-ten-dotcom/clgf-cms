import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';

import { getDatabasePool } from '../database/database-pool';
import { PushNotificationsService } from '../push-notifications/push-notifications.service';

@Injectable()
export class AnnouncementSchedulerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(AnnouncementSchedulerService.name);
  private timer?: ReturnType<typeof setInterval>;
  private running = false;

  constructor(
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  onModuleInit() {
    void this.checkDueAnnouncements();

    this.timer = setInterval(() => {
      void this.checkDueAnnouncements();
    }, 60_000);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async checkDueAnnouncements() {
    if (this.running) return;
    this.running = true;

    try {
      const pool = getDatabasePool();

      const result = await pool.query(`
        UPDATE announcements
        SET notification_claimed_at = NOW()
        WHERE id IN (
          SELECT id
          FROM announcements
          WHERE status = 'PUBLISHED'
            AND publish_date <=
              (NOW() AT TIME ZONE 'Africa/Johannesburg')::date
            AND (
              expiry_date IS NULL
              OR expiry_date >=
                (NOW() AT TIME ZONE 'Africa/Johannesburg')::date
            )
            AND notification_sent_at IS NULL
            AND (
              notification_claimed_at IS NULL
              OR notification_claimed_at <
                NOW() - INTERVAL '15 minutes'
            )
          FOR UPDATE SKIP LOCKED
        )
        RETURNING id, title, message,
          notification_target, target_home_cell_id,
          target_member_ids
      `);

      for (const announcement of result.rows) {
        try {
          const delivery =
            await this.pushNotificationsService.sendToTarget(
              {
                title: announcement.title,
                body: announcement.message,
                url: `/?announcement=${announcement.id}`,
                tag: `announcement-${announcement.id}`,
              },
              announcement.notification_target || 'EVERYONE',
              {
                homeCellId: announcement.target_home_cell_id,
                memberIds: announcement.target_member_ids || [],
              },
            );

          await pool.query(
            `UPDATE announcements
             SET notification_sent_at = NOW(),
                 notification_claimed_at = NULL
             WHERE id = $1`,
            [announcement.id],
          );

          this.logger.log(
            `Announcement ${announcement.id}: ${delivery.sent} sent, ${delivery.failed} failed`,
          );
        } catch (error) {
          this.logger.error(
            `Announcement ${announcement.id} push failed`,
            error instanceof Error ? error.stack : String(error),
          );

          await pool.query(
            `UPDATE announcements
             SET notification_claimed_at = NULL
             WHERE id = $1
               AND notification_sent_at IS NULL`,
            [announcement.id],
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'Scheduled announcement check failed',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.running = false;
    }
  }
}
