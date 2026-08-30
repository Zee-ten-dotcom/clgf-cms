import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  private async db() {
    return getDatabasePool().connect();
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new UnauthorizedException(
        'Email and password are required',
      );
    }

    const client = await this.db();

    try {
      const result = await client.query(
        `
        SELECT
          id,
          email,
          password_hash,
          first_name,
          last_name,
          role,
          is_active
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
        `,
        [email.trim()],
      );

      if (result.rows.length === 0) {
        throw new UnauthorizedException(
          'Invalid email or password',
        );
      }

      const user = result.rows[0];

      if (!user.is_active) {
        throw new UnauthorizedException(
          'This account is inactive',
        );
      }

      const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash,
      );

      if (!passwordMatches) {
        throw new UnauthorizedException(
          'Invalid email or password',
        );
      }

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken =
        await this.jwtService.signAsync(payload);

      await client.query(
        `
        UPDATE users
        SET updated_at = NOW()
        WHERE id = $1
        `,
        [user.id],
      );

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
      };
    } finally {
      client.release();
    }
  }
}

import { getDatabasePool } from '../database/database-pool';