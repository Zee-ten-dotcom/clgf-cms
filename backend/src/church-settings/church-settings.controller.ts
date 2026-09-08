import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ChurchSettingsService,
} from './church-settings.service';

import {
  UpdateChurchSettingsDto,
} from './dto/update-church-settings.dto';

import {
  AuditService,
} from '../audit/audit.service';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard';

import {
  RolesGuard,
} from '../auth/roles.guard';

import {
  Roles,
} from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('church-settings')
export class ChurchSettingsController {
  constructor(
    private readonly churchSettingsService:
      ChurchSettingsService,
    private readonly auditService: AuditService,
  ) {}

  @Roles('ADMIN', 'LEADER')
  @Get()
  findOne() {
    return this.churchSettingsService.findOne();
  }

  @Roles('ADMIN')
  @Patch()
  async update(
    @Body() body: UpdateChurchSettingsDto,
    @Req() request: any,
  ) {
    const settings =
      await this.churchSettingsService.update(body);

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'CHURCH_SETTINGS',
      entityType: 'CHURCH_SETTINGS',
      entityId: settings.id,
      description:
        'Updated church profile and system settings',
      metadata: {
        churchName: settings.church_name,
        shortName: settings.short_name,
        timezone: settings.timezone,
      },
    });

    return settings;
  }
}
