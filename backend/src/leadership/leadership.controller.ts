import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { LeadershipService } from './leadership.service';
import { AuditService } from '../audit/audit.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { CreateLeadershipDto } from './dto/create-leadership.dto';
import { UpdateLeadershipDto } from './dto/update-leadership.dto';
import { LeadershipQueryDto } from './dto/leadership-query.dto';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leadership')
export class LeadershipController {
  constructor(
    private readonly leadershipService: LeadershipService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAll(
    @Query() query: LeadershipQueryDto,
  ) {
    return this.leadershipService.findAll(
      query.status,
      query.memberId,
      query.ministryId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.leadershipService.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(
    @Body() body: CreateLeadershipDto,
    @Req() request: any,
  ) {
    const assignment =
      await this.leadershipService.create(body);

    await this.auditService.log({
      actor: request.user,
      action: 'CREATE',
      module: 'LEADERSHIP',
      entityType: 'LEADERSHIP_ASSIGNMENT',
      entityId: assignment.id,
      description:
        `Created leadership assignment: ${assignment.role_title}`,
      metadata: {
        memberId: assignment.member_id,
        ministryId: assignment.ministry_id || null,
        roleTitle: assignment.role_title,
        roleType: assignment.role_type,
        status: assignment.status,
      },
    });

    return assignment;
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateLeadershipDto,
    @Req() request: any,
  ) {
    const assignment =
      await this.leadershipService.update(
        id,
        body,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'LEADERSHIP',
      entityType: 'LEADERSHIP_ASSIGNMENT',
      entityId: assignment.id,
      description:
        `Updated leadership assignment: ${assignment.role_title}`,
      metadata: {
        memberId: assignment.member_id,
        ministryId: assignment.ministry_id || null,
        roleTitle: assignment.role_title,
        roleType: assignment.role_type,
        status: assignment.status,
      },
    });

    return assignment;
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    const result =
      await this.leadershipService.remove(id);

    const assignment = result.assignment;

    await this.auditService.log({
      actor: request.user,
      action: 'DELETE',
      module: 'LEADERSHIP',
      entityType: 'LEADERSHIP_ASSIGNMENT',
      entityId: assignment.id,
      description:
        `Deleted leadership assignment: ${assignment.role_title}`,
      metadata: {
        memberId: assignment.member_id,
        ministryId: assignment.ministry_id || null,
        roleTitle: assignment.role_title,
        roleType: assignment.role_type,
        status: assignment.status,
      },
    });

    return result;
  }
}
