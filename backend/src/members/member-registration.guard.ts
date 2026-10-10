import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable,
} from '@nestjs/common';
import { getDatabasePool } from '../database/database-pool';

@Injectable()
export class MemberRegistrationGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = context.switchToHttp().getRequest().user;
    if (user?.role === 'ADMIN') return true;
    if (user?.role !== 'LEADER' || !user?.sub) {
      throw new ForbiddenException('Member registration denied');
    }

    const client = await getDatabasePool().connect();
    try {
      const result = await client.query(`
        SELECT 1 FROM users u
        JOIN leadership_assignments l ON l.member_id = u.member_id
        WHERE u.id = $1 AND u.is_active = true
          AND l.status = 'ACTIVE'
          AND (
            LOWER(TRIM(l.role_title)) IN
              ('home cell leader', 'homecell leader', 'home-cell leader')
            OR LOWER(l.role_title) ~
              '(^|[,;/]) *home *cell leader'
          )
        LIMIT 1
      `, [user.sub]);

      if (!result.rowCount) {
        throw new ForbiddenException('Assigned Home Cell Leader required');
      }
      return true;
    } finally {
      client.release();
    }
  }
}
