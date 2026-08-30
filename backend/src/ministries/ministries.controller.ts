import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { MinistriesService } from './ministries.service';
import { AuditService } from '../audit/audit.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { CreateMinistryDto } from './dto/create-ministry.dto';
import { UpdateMinistryDto } from './dto/update-ministry.dto';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ministries')
export class MinistriesController {
  constructor(
    private readonly ministriesService: MinistriesService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAll() {
    return this.ministriesService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.ministriesService.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(
    @Body() body: CreateMinistryDto,
    @Req() request: any,
  ) {
    const ministry =
      await this.ministriesService.create(body);

    await this.auditService.log({
      actor: request.user,
      action: 'CREATE',
      module: 'MINISTRIES',
      entityType: 'MINISTRY',
      entityId: ministry.id,
      description:
        `Created ministry: ${ministry.name}`,
      metadata: {
        name: ministry.name,
        leaderId: ministry.leader_id || null,
      },
    });

    return ministry;
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateMinistryDto,
    @Req() request: any,
  ) {
    const ministry =
      await this.ministriesService.update(
        id,
        body,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'MINISTRIES',
      entityType: 'MINISTRY',
      entityId: ministry.id,
      description:
        `Updated ministry: ${ministry.name}`,
      metadata: {
        name: ministry.name,
        leaderId: ministry.leader_id || null,
      },
    });

    return ministry;
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    const result =
      await this.ministriesService.remove(id);

    const ministry = result.ministry;

    await this.auditService.log({
      actor: request.user,
      action: 'DELETE',
      module: 'MINISTRIES',
      entityType: 'MINISTRY',
      entityId: ministry.id,
      description:
        `Deleted ministry: ${ministry.name}`,
      metadata: {
        name: ministry.name,
        leaderId: ministry.leader_id || null,
      },
    });

    return result;
  }
}
