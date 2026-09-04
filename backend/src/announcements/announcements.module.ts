import { Module } from '@nestjs/common';

import { AnnouncementsController } from './announcements.controller';
import { PublicAnnouncementsController } from './public-announcements.controller';
import { AnnouncementsService } from './announcements.service';

import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    AuthModule,
    AuditModule,
  ],
  controllers: [
    AnnouncementsController,
    PublicAnnouncementsController,
  ],
  providers: [
    AnnouncementsService,
  ],
})
export class AnnouncementsModule {}
