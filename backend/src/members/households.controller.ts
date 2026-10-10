import {
  Body, Controller, Delete, Get, Param, Post,
  Req, UseGuards, ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { IsIn, IsString, IsUUID, MaxLength } from 'class-validator';
import { getDatabasePool } from '../database/database-pool';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuditService } from '../audit/audit.service';

class CreateHouseholdDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsString()
  @MaxLength(300)
  address!: string;

  @IsString()
  @MaxLength(50)
  phone!: string;
}

class AddHouseholdMemberDto {
  @IsUUID()
  memberId!: string;

  @IsIn(['HEAD', 'SPOUSE', 'CHILD', 'PARENT', 'GUARDIAN', 'OTHER'])
  relationship!: string;
}

@Controller('households')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HouseholdsController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @Roles('ADMIN', 'LEADER')
  async list() {
    const client = await getDatabasePool().connect();
    try {
      const result = await client.query(`
        SELECT h.*, COALESCE(
          json_agg(
            json_build_object(
              'id', hm.id,
              'member_id', m.id,
              'first_name', m.first_name,
              'last_name', m.last_name,
              'relationship', hm.relationship
            )
          ) FILTER (WHERE m.id IS NOT NULL), '[]'
        ) AS members
        FROM households h
        LEFT JOIN household_members hm ON hm.household_id = h.id
        LEFT JOIN members m ON m.id = hm.member_id
        GROUP BY h.id
        ORDER BY h.name
      `);
      return result.rows;
    } finally {
      client.release();
    }
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() body: CreateHouseholdDto, @Req() req: any) {
    if (!body.name?.trim()) {
      throw new BadRequestException('Household name is required');
    }
    const client = await getDatabasePool().connect();
    try {
      const result = await client.query(
        `INSERT INTO households (name, address, phone)
         VALUES ($1, $2, $3) RETURNING *`,
        [body.name.trim(), body.address || '', body.phone || ''],
      );
      await this.audit.log({
        actor: req.user, action: 'CREATE_HOUSEHOLD',
        module: 'MEMBERS', entityType: 'HOUSEHOLD',
        entityId: result.rows[0].id,
        description: `Created household ${body.name.trim()}`,
      });
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  @Post(':id/members')
  @Roles('ADMIN')
  async addMember(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: AddHouseholdMemberDto,
    @Req() req: any,
  ) {
    const client = await getDatabasePool().connect();
    try {
      const result = await client.query(
        `INSERT INTO household_members
         (household_id, member_id, relationship)
         VALUES ($1, $2, $3)
         ON CONFLICT (member_id)
         DO UPDATE SET household_id = EXCLUDED.household_id,
                       relationship = EXCLUDED.relationship
         RETURNING *`,
        [id, body.memberId, body.relationship],
      );
      await this.audit.log({
        actor: req.user, action: 'ASSIGN_HOUSEHOLD_MEMBER',
        module: 'MEMBERS', entityType: 'HOUSEHOLD',
        entityId: id,
        description: 'Assigned member to household',
      });
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  @Delete(':id/members/:memberId')
  @Roles('ADMIN')
  async removeMember(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('memberId', new ParseUUIDPipe()) memberId: string,
    @Req() req: any,
  ) {
    const client = await getDatabasePool().connect();
    try {
      const result = await client.query(
        `DELETE FROM household_members
         WHERE household_id = $1 AND member_id = $2 RETURNING *`,
        [id, memberId],
      );
      if (!result.rowCount) {
        throw new BadRequestException('Household member not found');
      }
      await this.audit.log({
        actor: req.user, action: 'REMOVE_HOUSEHOLD_MEMBER',
        module: 'MEMBERS', entityType: 'HOUSEHOLD',
        entityId: id,
        description: 'Removed member from household',
      });
      return { success: true };
    } finally {
      client.release();
    }
  }
}
