import { Module } from '@nestjs/common';

import { WeeklyServicesController } from './weekly-services.controller';
import { PublicWeeklyServicesController } from './public-weekly-services.controller';
import { WeeklyServicesService } from './weekly-services.service';

import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    AuthModule,
    AuditModule,
  ],
  controllers: [
    WeeklyServicesController,
    PublicWeeklyServicesController,
  ],
  providers: [
    WeeklyServicesService,
  ],
})
export class WeeklyServicesModule {}
