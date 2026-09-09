import { Module } from '@nestjs/common';

import { ChurchActivitiesController } from './church-activities.controller';
import { PublicChurchActivitiesController } from './public-church-activities.controller';
import { ChurchActivitiesService } from './church-activities.service';
import { ChurchActivityMediaService } from './church-activity-media.service';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    AuthModule,
    AuditModule,
  ],
  controllers: [
    ChurchActivitiesController,
    PublicChurchActivitiesController,
  ],
  providers: [
    ChurchActivitiesService,
    ChurchActivityMediaService,
  ],
})
export class ChurchActivitiesModule {}
