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
