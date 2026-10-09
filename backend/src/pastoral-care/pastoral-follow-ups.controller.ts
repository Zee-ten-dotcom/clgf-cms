import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { PastoralFollowUpsService } from './pastoral-follow-ups.service';
import { CreatePastoralFollowUpDto } from './dto/create-pastoral-follow-up.dto';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pastoral-care/:id/follow-ups')
export class PastoralFollowUpsController {
  constructor(
    private readonly service: PastoralFollowUpsService,
    private readonly auditService: AuditService,
  ) {}

  @Roles('ADMIN', 'LEADER')
  @Get()
  findAll(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: any,
  ) {
    return this.service.findAll(id, request.user);
  }

  @Roles('ADMIN', 'LEADER')
  @Post()
  async create(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreatePastoralFollowUpDto,
    @Req() request: any,
  ) {
    const record = await this.service.create(
      id,
      request.user,
      body,
    );

    await this.auditService.log({
      actor: request.user,
      action: 'CREATE',
      module: 'PASTORAL_CARE',
      entityType: 'PASTORAL_CARE_FOLLOW_UP',
      entityId: record.id,
      description: 'Recorded pastoral care follow-up',
      metadata: {
        pastoralCareId: id,
        contactMethod: record.contact_method,
        outcome: record.outcome,
      },
    });

    return record;
  }
}
