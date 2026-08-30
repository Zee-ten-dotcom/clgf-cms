import { Module } from '@nestjs/common';

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
  ],
  providers: [
    PastoralCareService,
  ],
})
export class PastoralCareModule {}
