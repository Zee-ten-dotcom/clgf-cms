import {
  BadRequestException,
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { getDatabasePool } from '../database/database-pool';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

class CloseCaseDto {
  @IsIn(['COMPLETED', 'CLOSED'])
  status: 'COMPLETED' | 'CLOSED';

  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  reason: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pastoral-care')
export class PastoralCaseClosureController {
  constructor(private readonly audit: AuditService) {}

  @Roles('ADMIN')
  @Patch(':id/close')
  async close(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CloseCaseDto,
    @Req() request: any,
  ) {
    if (
      !['COMPLETED', 'CLOSED'].includes(body?.status) ||
      typeof body?.reason !== 'string' ||
      body.reason.trim().length < 5 ||
      body.reason.length > 2000
    ) {
      throw new BadRequestException(
        'Valid status and closure reason required',
      );
    }

    const pool = getDatabasePool();
    const client = await pool.connect();

    let record: any;

    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE pastoral_care_records
         SET status = $1,
             updated_at = NOW()
         WHERE id = $2
           AND status NOT IN ('COMPLETED', 'CLOSED')
         RETURNING id, status, member_id`,
        [body.status, id],
      );

      if (!result.rows.length) {
        throw new BadRequestException(
          'Case not found or already completed/closed',
        );
      }

      record = result.rows[0];

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    await this.audit.log({
      actor: request.user,
      action: 'CLOSE',
      module: 'PASTORAL_CARE',
      entityType: 'PASTORAL_CARE_RECORD',
      entityId: id,
      description: `Pastoral care case ${body.status.toLowerCase()}`,
      metadata: {
        status: body.status,
        closureReason: body.reason.trim(),
        closureDate: new Date().toISOString(),
      },
    });

    return {
      ...record,
      closureReason: body.reason.trim(),
      closureDate: new Date().toISOString(),
    };
  }
}
