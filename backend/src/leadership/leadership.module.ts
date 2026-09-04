import { Module } from '@nestjs/common';

import { LeadershipController } from './leadership.controller';
import { PublicLeadershipController } from './public-leadership.controller';
import { LeadershipService } from './leadership.service';

import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    AuthModule,
    AuditModule,
  ],
  controllers: [
    LeadershipController,
    PublicLeadershipController,
  ],
  providers: [
    LeadershipService,
  ],
})
export class LeadershipModule {}
