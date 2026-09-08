import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  getDatabasePool,
} from '../database/database-pool';

import {
  UpdateChurchSettingsDto,
} from './dto/update-church-settings.dto';

const SETTINGS_ID =
  '00000000-0000-4000-8000-000000000001';

@Injectable()
export class ChurchSettingsService {
  private async db() {
    return getDatabasePool().connect();
  }

  async findOne() {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        SELECT
          id,
          church_name,
          short_name,
          scripture,
          mission,
          vision,
          motto,
          email,
          phone,
          address,
          website,
          timezone,
          created_at,
          updated_at
        FROM church_settings
        WHERE id = $1
        `,
        [SETTINGS_ID],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException(
          'Church settings not found',
        );
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async update(body: UpdateChurchSettingsDto) {
    const current = await this.findOne();
    const client = await this.db();

    try {
      const result = await client.query(
        `
        UPDATE church_settings
        SET
          church_name = $2,
          short_name = $3,
          scripture = $4,
          mission = $5,
          vision = $6,
          motto = $7,
          email = $8,
          phone = $9,
          address = $10,
          website = $11,
          timezone = $12,
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          church_name,
          short_name,
          scripture,
          mission,
          vision,
          motto,
          email,
          phone,
          address,
          website,
          timezone,
          created_at,
          updated_at
        `,
        [
          SETTINGS_ID,
          body.churchName !== undefined
            ? body.churchName.trim() ||
              current.church_name
            : current.church_name,
          body.shortName !== undefined
            ? body.shortName.trim() || null
            : current.short_name,
          body.scripture !== undefined
            ? body.scripture.trim() || null
            : current.scripture,
          body.mission !== undefined
            ? body.mission.trim() || null
            : current.mission,
          body.vision !== undefined
            ? body.vision.trim() || null
            : current.vision,
          body.motto !== undefined
            ? body.motto.trim() || null
            : current.motto,
          body.email !== undefined
            ? body.email.trim() || null
            : current.email,
          body.phone !== undefined
            ? body.phone.trim() || null
            : current.phone,
          body.address !== undefined
            ? body.address.trim() || null
            : current.address,
          body.website !== undefined
            ? body.website.trim() || null
            : current.website,
          body.timezone !== undefined
            ? body.timezone.trim() ||
              current.timezone
            : current.timezone,
        ],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }
}
