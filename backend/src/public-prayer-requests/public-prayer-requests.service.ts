import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { getDatabasePool } from '../database/database-pool';

@Injectable()
export class PublicPrayerRequestsService {
  private async db() {
    return getDatabasePool().connect();
  }

  async create(data: {
    requesterName: string;
    contact?: string;
    prayerRequest: string;
    confidential?: boolean;
  }) {
    const requesterName = data.requesterName?.trim();
    const prayerRequest = data.prayerRequest?.trim();

    if (!requesterName) {
      throw new BadRequestException('Name is required');
    }

    if (!prayerRequest) {
      throw new BadRequestException(
        'Prayer request is required',
      );
    }

    const client = await this.db();

    try {
      const result = await client.query(
        `
        INSERT INTO public_prayer_requests (
          requester_name,
          contact,
          prayer_request,
          confidential
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          status,
          created_at
        `,
        [
          requesterName,
          data.contact?.trim() || null,
          prayerRequest,
          data.confidential ?? false,
        ],
      );

      return {
        message: 'Prayer request submitted successfully',
        ...result.rows[0],
      };
    } finally {
      client.release();
    }
  }

  async findAll() {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        SELECT *
        FROM public_prayer_requests
        ORDER BY created_at DESC
        `,
      );

      return result.rows;
    } finally {
      client.release();
    }
  }

  async updateStatus(
    id: string,
    status: string,
  ) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        UPDATE public_prayer_requests
        SET
          status = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
        `,
        [
          status.trim().toUpperCase(),
          id,
        ],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Prayer request not found',
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
        DELETE FROM public_prayer_requests
        WHERE id = $1
        RETURNING id
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Prayer request not found',
        );
      }

      return {
        message: 'Prayer request deleted',
        id: result.rows[0].id,
      };
    } finally {
      client.release();
    }
  }
}
