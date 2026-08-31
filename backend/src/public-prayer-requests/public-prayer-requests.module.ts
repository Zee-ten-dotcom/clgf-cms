import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { PublicPrayerRequestsController } from './public-prayer-requests.controller';
import { PublicPrayerRequestsService } from './public-prayer-requests.service';

@Module({
  imports: [
    AuthModule,
  ],
  controllers: [
    PublicPrayerRequestsController,
  ],
  providers: [
    PublicPrayerRequestsService,
  ],
})
export class PublicPrayerRequestsModule {}
