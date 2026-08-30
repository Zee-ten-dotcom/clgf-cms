import { Module } from '@nestjs/common';

import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';

import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    AuthModule,
    AuditModule,
  ],
  providers: [
    AttendanceService,
  ],
  controllers: [
    AttendanceController,
  ],
})
export class AttendanceModule {}
