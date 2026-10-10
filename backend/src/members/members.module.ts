import { Module } from '@nestjs/common';

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
  ],
  providers: [
    MembersService,
    MemberRegistrationGuard,
  ],
})
export class MembersModule {}
