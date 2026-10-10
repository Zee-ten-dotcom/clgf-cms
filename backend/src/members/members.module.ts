import { HouseholdsController } from './households.controller';
import { Module } from '@nestjs/common';
import { MemberTransfersService } from './member-transfers.service';
import { MemberTransfersController } from './member-transfers.controller';

import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { MemberRegistrationGuard } from './member-registration.guard';

@Module({
  imports: [
    AuthModule,
    AuditModule,
  ],
  controllers: [
    MembersController,
    HouseholdsController,
    MemberTransfersController,
  ],
  providers: [
    MembersService,
    MemberTransfersService,
    MemberRegistrationGuard,
  ],
})
export class MembersModule {}
