import {
  Controller, Get, Param, ParseUUIDPipe, UseGuards,
} from '@nestjs/common';
import { getDatabasePool } from '../database/database-pool';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pastoral-care')
export class PastoralClosureHistoryController {
  @Roles('ADMIN')
  @Get(':id/closure-history')
  async history(@Param('id', ParseUUIDPipe) id: string) {
    const pool = getDatabasePool();
    const result = await pool.query(
      `SELECT
         action,
         actor_name,
         actor_email,
         description,
         metadata->>'status' AS status,
         metadata->>'closureReason' AS reason,
         created_at
       FROM audit_logs
       WHERE module = 'PASTORAL_CARE'
         AND entity_type = 'PASTORAL_CARE_RECORD'
         AND entity_id = $1
         AND action = 'CLOSE'
       ORDER BY created_at DESC`,
      [id],
    );
    return result.rows;
  }
}
