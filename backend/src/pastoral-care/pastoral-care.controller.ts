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

import { PastoralCareService } from './pastoral-care.service';
import { AuditService } from '../audit/audit.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { CreatePastoralCareDto } from './dto/create-pastoral-care.dto';
import { UpdatePastoralCareDto } from './dto/update-pastoral-care.dto';
import { PastoralCareQueryDto } from './dto/pastoral-care-query.dto';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pastoral-care')
export class PastoralCareController {
  constructor(
    private readonly pastoralCareService: PastoralCareService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAll(
    @Query() query: PastoralCareQueryDto,
  ) {
    return this.pastoralCareService.findAll(
      query.status,
      query.memberId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.pastoralCareService.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(
    @Body() body: CreatePastoralCareDto,
    @Req() request: any,
  ) {
    const record =
      await this.pastoralCareService.create(body);

    await this.auditService.log({
      actor: request.user,
      action: 'CREATE',
      module: 'PASTORAL_CARE',
      entityType: 'PASTORAL_CARE_RECORD',
      entityId: record.id,
      description:
        'Created pastoral care record',
      metadata: {
        memberId: record.member_id,
        careType: record.care_type,
        priority: record.priority,
        status: record.status,
        assignedLeaderId:
          record.assigned_leader_id || null,
        careDate: record.care_date || null,
        followUpDate:
          record.follow_up_date || null,
      },
    });

    return record;
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdatePastoralCareDto,
    @Req() request: any,
  ) {
    const record =
      await this.pastoralCareService.update(
        id,
        body,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'PASTORAL_CARE',
      entityType: 'PASTORAL_CARE_RECORD',
      entityId: record.id,
      description:
        'Updated pastoral care record',
      metadata: {
        memberId: record.member_id,
        careType: record.care_type,
        priority: record.priority,
        status: record.status,
        assignedLeaderId:
          record.assigned_leader_id || null,
        careDate: record.care_date || null,
        followUpDate:
          record.follow_up_date || null,
      },
    });

    return record;
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    const record =
      await this.pastoralCareService.remove(id);

    await this.auditService.log({
      actor: request.user,
      action: 'DELETE',
      module: 'PASTORAL_CARE',
      entityType: 'PASTORAL_CARE_RECORD',
      entityId: record.id,
      description:
        'Deleted pastoral care record',
      metadata: {
        memberId: record.member_id,
        careType: record.care_type,
        priority: record.priority,
        status: record.status,
        assignedLeaderId:
          record.assigned_leader_id || null,
      },
    });

    return record;
  }
}
