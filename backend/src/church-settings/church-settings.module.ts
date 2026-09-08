import { Module } from '@nestjs/common';

import {
  ChurchSettingsController,
} from './church-settings.controller';

import {
  ChurchSettingsService,
} from './church-settings.service';

import {
  AuthModule,
} from '../auth/auth.module';

import {
  AuditModule,
} from '../audit/audit.module';

@Module({
  imports: [
    AuthModule,
    AuditModule,
  ],
  controllers: [
    ChurchSettingsController,
  ],
  providers: [
    ChurchSettingsService,
  ],
})
export class ChurchSettingsModule {}
