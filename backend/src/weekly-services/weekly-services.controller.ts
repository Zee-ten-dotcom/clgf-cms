import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { WeeklyServicesService } from './weekly-services.service';
import { AuditService } from '../audit/audit.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { CreateWeeklyServiceDto } from './dto/create-weekly-service.dto';
import { UpdateWeeklyServiceDto } from './dto/update-weekly-service.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('weekly-services')
export class WeeklyServicesController {
  constructor(
    private readonly weeklyServicesService: WeeklyServicesService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAll() {
    return this.weeklyServicesService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.weeklyServicesService.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(
    @Body() body: CreateWeeklyServiceDto,
    @Req() request: any,
  ) {
    const service = await this.weeklyServicesService.create(body);

    await this.auditService.log({
      actor: request.user,
      action: 'CREATE',
      module: 'WEEKLY_SERVICES',
      entityType: 'WEEKLY_SERVICE',
      entityId: service.id,
      description: `Created weekly service: ${service.name}`,
      metadata: {
        name: service.name,
        dayOfWeek: service.day_of_week,
        status: service.status,
        publicVisible: service.public_visible,
        displayOrder: service.display_order,
      },
    });

    return service;
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateWeeklyServiceDto,
    @Req() request: any,
  ) {
    const service =
      await this.weeklyServicesService.update(id, body);

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'WEEKLY_SERVICES',
      entityType: 'WEEKLY_SERVICE',
      entityId: service.id,
      description: `Updated weekly service: ${service.name}`,
      metadata: {
        name: service.name,
        dayOfWeek: service.day_of_week,
        status: service.status,
        publicVisible: service.public_visible,
        displayOrder: service.display_order,
      },
    });

    return service;
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    const service =
      await this.weeklyServicesService.remove(id);

    await this.auditService.log({
      actor: request.user,
      action: 'DELETE',
      module: 'WEEKLY_SERVICES',
      entityType: 'WEEKLY_SERVICE',
      entityId: service.id,
      description: `Deleted weekly service: ${service.name}`,
      metadata: {
        name: service.name,
        dayOfWeek: service.day_of_week,
      },
    });

    return service;
  }
}
