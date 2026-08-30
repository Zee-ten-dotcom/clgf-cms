import { Module } from '@nestjs/common';

import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';

import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    AuthModule,
    AuditModule,
  ],
  controllers: [
    FinanceController,
  ],
  providers: [
    FinanceService,
  ],
})
export class FinanceModule {}
