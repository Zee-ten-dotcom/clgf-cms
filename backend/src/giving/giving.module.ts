import { Module } from '@nestjs/common';

import { GivingController } from './giving.controller';
import { GivingService } from './giving.service';

import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    AuthModule,
    AuditModule,
  ],
  controllers: [
    GivingController,
  ],
  providers: [
    GivingService,
  ],
})
export class GivingModule {}
