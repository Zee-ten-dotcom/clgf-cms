import { Module } from '@nestjs/common';

import { AnnouncementsController } from './announcements.controller';
import { PublicAnnouncementsController } from './public-announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementSchedulerController } from './announcement-scheduler.controller';
import { AnnouncementSchedulerService } from './announcement-scheduler.service';

import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { PushNotificationsModule } from '../push-notifications/push-notifications.module';

@Module({
  imports: [
    AuthModule,
    AuditModule,
    PushNotificationsModule,
  ],
  controllers: [
    AnnouncementsController,
    PublicAnnouncementsController,
    AnnouncementSchedulerController,
  ],
  providers: [
    AnnouncementsService,
    AnnouncementSchedulerService,
  ],
})
export class AnnouncementsModule {}
