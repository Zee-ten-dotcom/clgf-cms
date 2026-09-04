import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { MembersModule } from './members/members.module';
import { MinistriesModule } from './ministries/ministries.module';
import { HomeCellsModule } from './home-cells/home-cells.module';
import { AttendanceModule } from './attendance/attendance.module';
import { FinanceModule } from './finance/finance.module';
import { GivingModule } from './giving/giving.module';
import { EventsModule } from './events/events.module';
import { PastoralCareModule } from './pastoral-care/pastoral-care.module';
import { LeadershipModule } from './leadership/leadership.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { validateEnv } from './config/env.validation';
import { DatabaseLifecycleService } from './database/database-lifecycle.service';
import { PublicPrayerRequestsModule } from './public-prayer-requests/public-prayer-requests.module';
import { SermonsModule } from './sermons/sermons.module';
import { ContactEnquiriesModule } from './contact-enquiries/contact-enquiries.module';
import { WeeklyServicesModule } from './weekly-services/weekly-services.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    MembersModule,
    MinistriesModule,
    HomeCellsModule,
    AttendanceModule,
    FinanceModule,
    GivingModule,
    EventsModule,
    PastoralCareModule,
    LeadershipModule,
    AuthModule,
    UsersModule,
    PublicPrayerRequestsModule,
    SermonsModule,
    ContactEnquiriesModule,
    WeeklyServicesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    DatabaseLifecycleService,
    AppService,
  ],
})
export class AppModule {}
