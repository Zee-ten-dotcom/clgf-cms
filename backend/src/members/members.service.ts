import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { getDatabasePool } from '../database/database-pool';

@Injectable()
export class MembersService {
  private async db() {
    return getDatabasePool().connect();
  }

  async findAll() {
    const client = await this.db();

    try {
      const result = await client.query(`
        SELECT
          m.*,
          hc.name AS home_cell_name
        FROM members m
        LEFT JOIN home_cells hc
          ON hc.id = m.home_cell_id
        ORDER BY m.created_at DESC
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
          m.*,
          hc.name AS home_cell_name
        FROM members m
        LEFT JOIN home_cells hc
          ON hc.id = m.home_cell_id
        WHERE m.id = $1
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Member not found',
        );
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  private async validateHomeCell(
    client: any,
    homeCellId?: string | null,
  ) {
    if (!homeCellId) {
      return;
    }

    const result = await client.query(
      `
      SELECT id
      FROM home_cells
      WHERE id = $1
      `,
      [homeCellId],
    );

    if (result.rows.length === 0) {
      throw new BadRequestException(
        'Home Cell not found',
      );
    }
  }

  async create(data: {
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    gender?: string;
    maritalStatus?: string;
    dateOfBirth?: string;
    address?: string;
    homeCellId?: string;
  }) {
    const client = await this.db();

    try {
      await this.validateHomeCell(
        client,
        data.homeCellId,
      );

      const membershipNumber =
        `CLGF-${Date.now()}`;

      const result = await client.query(
        `
        INSERT INTO members (
          membership_number,
          first_name,
          last_name,
          phone,
          email,
          gender,
          marital_status,
          date_of_birth,
          address,
          joined_at,
          home_cell_id
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,
          CURRENT_DATE,$10
        )
        RETURNING *
        `,
        [
          membershipNumber,
          data.firstName,
          data.lastName,
          data.phone ?? null,
          data.email ?? null,
          data.gender ?? null,
          data.maritalStatus ?? null,
          data.dateOfBirth ?? null,
          data.address ?? null,
          data.homeCellId ?? null,
        ],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      email?: string;
      gender?: string;
      maritalStatus?: string;
      dateOfBirth?: string;
      address?: string;
      homeCellId?: string | null;
    },
  ) {
    const client = await this.db();

    try {
      if (data.homeCellId !== undefined) {
        await this.validateHomeCell(
          client,
          data.homeCellId,
        );
      }

      const updateHomeCell =
        data.homeCellId !== undefined;

      const result = await client.query(
        `
        UPDATE members
        SET
          first_name =
            COALESCE($1, first_name),
          last_name =
            COALESCE($2, last_name),
          phone =
            COALESCE($3, phone),
          email =
            COALESCE($4, email),
          address =
            COALESCE($5, address),
          gender =
            COALESCE($6, gender),
          marital_status =
            COALESCE($7, marital_status),
          date_of_birth =
            COALESCE($8, date_of_birth),
          home_cell_id =
            CASE
              WHEN $9::boolean
                THEN $10::uuid
              ELSE home_cell_id
            END,
          updated_at = NOW()
        WHERE id = $11
        RETURNING *
        `,
        [
          data.firstName ?? null,
          data.lastName ?? null,
          data.phone ?? null,
          data.email ?? null,
          data.address ?? null,
          data.gender ?? null,
          data.maritalStatus ?? null,
          data.dateOfBirth ?? null,
          updateHomeCell,
          data.homeCellId ?? null,
          id,
        ],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Member not found',
        );
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async deactivate(id: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        UPDATE members
        SET
          status = 'INACTIVE',
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Member not found',
        );
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async reactivate(id: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        UPDATE members
        SET
          status = 'ACTIVE',
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Member not found',
        );
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }
}
