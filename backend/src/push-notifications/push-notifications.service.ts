import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as webpush from 'web-push';

import { getDatabasePool } from '../database/database-pool';

type PushSubscriptionInput = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

@Injectable()
export class PushNotificationsService {
  private configureWebPush() {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;

    if (!publicKey || !privateKey || !subject) {
      throw new InternalServerErrorException(
        'Push notification configuration is incomplete',
      );
    }

    webpush.setVapidDetails(
      subject,
      publicKey,
      privateKey,
    );
  }

  getPublicKey() {
    const publicKey = process.env.VAPID_PUBLIC_KEY;

    if (!publicKey) {
      throw new InternalServerErrorException(
        'Push notification public key is not configured',
      );
    }

    return {
      publicKey,
    };
  }

  async subscribe(
    userId: string,
    subscription: PushSubscriptionInput,
  ) {
    const client =
      await getDatabasePool().connect();

    try {
      const result = await client.query(
        `
        INSERT INTO push_subscriptions (
          user_id,
          endpoint,
          p256dh,
          auth
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (endpoint)
        DO UPDATE SET
          user_id = EXCLUDED.user_id,
          p256dh = EXCLUDED.p256dh,
          auth = EXCLUDED.auth,
          updated_at = NOW()
        RETURNING id
        `,
        [
          userId,
          subscription.endpoint,
          subscription.keys.p256dh,
          subscription.keys.auth,
        ],
      );

      return {
        subscribed: true,
        id: result.rows[0].id,
      };
    } finally {
      client.release();
    }
  }

  async unsubscribe(
    userId: string,
    endpoint: string,
  ) {
    const client =
      await getDatabasePool().connect();

    try {
      await client.query(
        `
        DELETE FROM push_subscriptions
        WHERE user_id = $1
          AND endpoint = $2
        `,
        [userId, endpoint],
      );

      return {
        subscribed: false,
      };
    } finally {
      client.release();
    }
  }

  async sendToTarget(
    payload: {
      title: string;
      body: string;
      url?: string;
      tag?: string;
    },
    target: 'EVERYONE' | 'LEADERS' | 'HOME_CELL' | 'SELECTED_MEMBERS',
    options?: {
      homeCellId?: string | null;
      memberIds?: string[];
    },
  ) {
    this.configureWebPush();

    const client = await getDatabasePool().connect();

    try {
      let whereClause = '';
      const params: any[] = [];

      if (target === 'LEADERS') {
        whereClause = `
          WHERE EXISTS (
            SELECT 1
            FROM users u
            WHERE u.id = ps.user_id
              AND u.role IN ('ADMIN', 'LEADER')
          )
        `;
      } else if (target === 'HOME_CELL') {
        if (!options?.homeCellId) {
          throw new Error(
            'A Home Cell must be selected for HOME_CELL notifications',
          );
        }

        params.push(options.homeCellId);

        whereClause = `
          WHERE EXISTS (
            SELECT 1
            FROM users u
            JOIN members m
              ON m.id = u.member_id
            WHERE u.id = ps.user_id
              AND m.home_cell_id = $1
          )
        `;
      } else if (target === 'SELECTED_MEMBERS') {
        const memberIds = options?.memberIds || [];

        if (memberIds.length === 0) {
          throw new Error(
            'At least one member must be selected',
          );
        }

        params.push(memberIds);

        whereClause = `
          WHERE EXISTS (
            SELECT 1
            FROM users u
            WHERE u.id = ps.user_id
              AND u.member_id = ANY($1::uuid[])
          )
        `;
      }

      const result = await client.query(
        `
        SELECT DISTINCT
          ps.id,
          ps.endpoint,
          ps.p256dh,
          ps.auth
        FROM push_subscriptions ps
        ${whereClause}
        `,
        params,
      );

      let sent = 0;
      let failed = 0;

      for (const row of result.rows) {
        try {
          await webpush.sendNotification(
            {
              endpoint: row.endpoint,
              keys: {
                p256dh: row.p256dh,
                auth: row.auth,
              },
            },
            JSON.stringify(payload),
          );

          sent += 1;
        } catch (error: any) {
          failed += 1;

          if (
            error?.statusCode === 404 ||
            error?.statusCode === 410
          ) {
            await client.query(
              `
              DELETE FROM push_subscriptions
              WHERE id = $1
              `,
              [row.id],
            );
          } else {
            console.error(
              'Targeted push notification delivery failed:',
              error?.message || error,
            );
          }
        }
      }

      return {
        target,
        sent,
        failed,
      };
    } finally {
      client.release();
    }
  }


  async sendToAllUsers(payload: {
    title: string;
    body: string;
    url?: string;
    tag?: string;
  }) {
    this.configureWebPush();

    const client =
      await getDatabasePool().connect();

    try {
      const result = await client.query(`
        SELECT
          id,
          endpoint,
          p256dh,
          auth
        FROM push_subscriptions
      `);

      let sent = 0;
      let failed = 0;

      for (const row of result.rows) {
        const subscription = {
          endpoint: row.endpoint,
          keys: {
            p256dh: row.p256dh,
            auth: row.auth,
          },
        };

        try {
          await webpush.sendNotification(
            subscription,
            JSON.stringify(payload),
          );

          sent += 1;
        } catch (error: any) {
          failed += 1;

          if (
            error?.statusCode === 404 ||
            error?.statusCode === 410
          ) {
            await client.query(
              `
              DELETE FROM push_subscriptions
              WHERE id = $1
              `,
              [row.id],
            );
          } else {
            console.error(
              'Push notification delivery failed:',
              error?.message || error,
            );
          }
        }
      }

      return {
        sent,
        failed,
      };
    } finally {
      client.release();
    }
  }
}
