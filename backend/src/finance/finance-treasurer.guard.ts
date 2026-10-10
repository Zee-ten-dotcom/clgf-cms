import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { getDatabasePool } from '../database/database-pool';

@Injectable()
export class FinanceTreasurerGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.role === 'ADMIN') return true;

    if (user?.role !== 'LEADER' || !user?.sub) {
      throw new ForbiddenException('Finance access denied');
    }

    const client = await getDatabasePool().connect();

    try {
      const result = await client.query(
        `
        SELECT 1
        FROM users u
        JOIN leadership_assignments l
          ON l.member_id = u.member_id
        WHERE u.id = $1
          AND u.is_active = true
          AND l.status = 'ACTIVE'
          AND LOWER(TRIM(l.role_title)) IN
            ('treasurer', 'church treasurer', 'treasure')
        LIMIT 1
        `,
        [user.sub],
      );

      if (result.rowCount === 0) {
        throw new ForbiddenException(
          'Only the assigned Treasurer can manage finances',
        );
      }

      return true;
    } finally {
      client.release();
    }
  }
}
