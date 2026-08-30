import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private async db() {
    return getDatabasePool().connect();
  }

  async findAll() {
    const client = await this.db();

    try {
      const result = await client.query(`
        SELECT
          id,
          member_id,
          email,
          first_name,
          last_name,
          role,
          is_active,
          member_id,
          created_at,
          updated_at
        FROM users
        ORDER BY first_name, last_name, email
      `);

      return result.rows;
    } finally {
      client.release();
    }
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    memberId?: string | null;
  }) {
    if (!data.email?.trim()) {
      throw new BadRequestException('Email is required');
    }

    if (!data.password || data.password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters',
      );
    }

    if (!data.firstName?.trim()) {
      throw new BadRequestException('First name is required');
    }

    if (!data.lastName?.trim()) {
      throw new BadRequestException('Last name is required');
    }

    const role =
      data.role?.trim().toUpperCase() || 'LEADER';

    if (!['ADMIN', 'LEADER'].includes(role)) {
      throw new BadRequestException('Invalid role');
    }

    const client = await this.db();

    try {
      const existing = await client.query(
        `
        SELECT id
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
        `,
        [data.email.trim()],
      );

      if (existing.rows.length > 0) {
        throw new BadRequestException(
          'A user with this email already exists',
        );
      }

      const passwordHash = await bcrypt.hash(
        data.password,
        10,
      );

      const result = await client.query(
        `
        INSERT INTO users (
          email,
          password_hash,
          first_name,
          last_name,
          role,
          is_active,
          member_id
        )
        VALUES ($1, $2, $3, $4, $5, true, $6)
        RETURNING
          id,
          email,
          first_name,
          last_name,
          role,
          is_active,
          member_id,
          created_at,
          updated_at
        `,
        [
          data.email.trim().toLowerCase(),
          passwordHash,
          data.firstName.trim(),
          data.lastName.trim(),
          role,
          data.memberId || null,
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
      email?: string;
      firstName?: string;
      lastName?: string;
      role?: string;
      memberId?: string | null;
    },
  ) {
    const client = await this.db();

    try {
      const existingResult = await client.query(
        `
        SELECT *
        FROM users
        WHERE id = $1
        `,
        [id],
      );

      if (existingResult.rows.length === 0) {
        throw new BadRequestException('User not found');
      }

      const existing = existingResult.rows[0];

      const email =
        data.email !== undefined
          ? data.email.trim().toLowerCase()
          : existing.email;

      const firstName =
        data.firstName !== undefined
          ? data.firstName.trim()
          : existing.first_name;

      const lastName =
        data.lastName !== undefined
          ? data.lastName.trim()
          : existing.last_name;

      const role =
        data.role !== undefined
          ? data.role.trim().toUpperCase()
          : existing.role;

      const memberId =
        data.memberId !== undefined
          ? data.memberId || null
          : existing.member_id;

      if (!email) {
        throw new BadRequestException('Email is required');
      }

      if (!firstName) {
        throw new BadRequestException(
          'First name is required',
        );
      }

      if (!lastName) {
        throw new BadRequestException(
          'Last name is required',
        );
      }

      if (!['ADMIN', 'LEADER'].includes(role)) {
        throw new BadRequestException('Invalid role');
      }

      const duplicate = await client.query(
        `
        SELECT id
        FROM users
        WHERE LOWER(email) = LOWER($1)
          AND id <> $2
        LIMIT 1
        `,
        [email, id],
      );

      if (duplicate.rows.length > 0) {
        throw new BadRequestException(
          'A user with this email already exists',
        );
      }

      const result = await client.query(
        `
        UPDATE users
        SET
          email = $1,
          first_name = $2,
          last_name = $3,
          role = $4,
          member_id = $5,
          updated_at = NOW()
        WHERE id = $6
        RETURNING
          id,
          email,
          first_name,
          last_name,
          role,
          is_active,
          created_at,
          updated_at
        `,
        [
          email,
          firstName,
          lastName,
          role,
          memberId,
          id,
        ],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async setStatus(
    id: string,
    isActive: boolean,
    currentUserId?: string,
  ) {
    const client = await this.db();

    try {
      const targetResult = await client.query(
        `
        SELECT
          id,
          role,
          is_active
        FROM users
        WHERE id = $1
        `,
        [id],
      );

      if (targetResult.rows.length === 0) {
        throw new BadRequestException('User not found');
      }

      const target = targetResult.rows[0];

      if (!isActive && id === currentUserId) {
        throw new BadRequestException(
          'You cannot deactivate your own account',
        );
      }

      if (
        !isActive &&
        target.role === 'ADMIN' &&
        target.is_active
      ) {
        const adminResult = await client.query(
          `
          SELECT COUNT(*)::int AS count
          FROM users
          WHERE role = 'ADMIN'
            AND is_active = true
          `,
        );

        const activeAdmins =
          Number(adminResult.rows[0]?.count || 0);

        if (activeAdmins <= 1) {
          throw new BadRequestException(
            'The last active administrator cannot be deactivated',
          );
        }
      }

      const result = await client.query(
        `
        UPDATE users
        SET
          is_active = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING
          id,
          email,
          first_name,
          last_name,
          role,
          is_active,
          created_at,
          updated_at
        `,
        [isActive, id],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async resetPassword(
    id: string,
    password: string,
  ) {
    if (!password || password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters',
      );
    }

    const passwordHash = await bcrypt.hash(
      password,
      10,
    );

    const client = await this.db();

    try {
      const result = await client.query(
        `
        UPDATE users
        SET
          password_hash = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING id, email
        `,
        [passwordHash, id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('User not found');
      }

      return {
        message: 'Password reset successfully',
        userId: result.rows[0].id,
        email: result.rows[0].email,
      };
    } finally {
      client.release();
    }
  }
}

import { getDatabasePool } from '../database/database-pool';