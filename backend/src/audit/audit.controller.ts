import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  AuditService,
} from './audit.service';

import { AuditQueryDto } from './dto/audit-query.dto';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard';

import {
  RolesGuard,
} from '../auth/roles.guard';

import {
  Roles,
} from '../auth/roles.decorator';

@Roles('ADMIN')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Controller('audit')
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAll(
    @Query() query: AuditQueryDto,
  ) {
    return this.auditService.findAll(query);
  }

  @Get('summary')
  summary() {
    return this.auditService.summary();
  }
}
