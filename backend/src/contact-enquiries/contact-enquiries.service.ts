import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { getDatabasePool } from '../database/database-pool';

@Injectable()
export class ContactEnquiriesService {
  private async db() {
    return getDatabasePool().connect();
  }

  async create(data: {
    name: string;
    email?: string;
    phone?: string;
    subject: string;
    message: string;
  }) {
    const name = data.name?.trim();
    const subject = data.subject?.trim();
    const message = data.message?.trim();

    if (!name) {
      throw new BadRequestException('Name is required');
    }

    if (!subject) {
      throw new BadRequestException('Subject is required');
    }

    if (!message) {
      throw new BadRequestException('Message is required');
    }

    if (!data.email?.trim() && !data.phone?.trim()) {
      throw new BadRequestException(
        'Please provide an email address or phone number',
      );
    }

    const client = await this.db();

    try {
      const result = await client.query(
        `
        INSERT INTO contact_enquiries (
          name,
          email,
          phone,
          subject,
          message
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          status,
          created_at
        `,
        [
          name,
          data.email?.trim() || null,
          data.phone?.trim() || null,
          subject,
          message,
        ],
      );

      return {
        message: 'Enquiry submitted successfully',
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
        FROM contact_enquiries
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
        UPDATE contact_enquiries
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
          'Contact enquiry not found',
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
        DELETE FROM contact_enquiries
        WHERE id = $1
        RETURNING id
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Contact enquiry not found',
        );
      }

      return {
        message: 'Contact enquiry deleted',
        id: result.rows[0].id,
      };
    } finally {
      client.release();
    }
  }
}
