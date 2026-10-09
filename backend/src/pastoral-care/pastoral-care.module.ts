import { Module } from '@nestjs/common';
import { PastoralFollowUpsController } from './pastoral-follow-ups.controller';
import { PastoralFollowUpsService } from './pastoral-follow-ups.service';

import { PastoralCareController } from './pastoral-care.controller';
import { PastoralCareService } from './pastoral-care.service';

import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    AuthModule,
    AuditModule,
  ],
  controllers: [
    PastoralCareController,
    PastoralFollowUpsController,
  ],
  providers: [
    PastoralCareService,
    PastoralFollowUpsService,
  ],
})
export class PastoralCareModule {}
