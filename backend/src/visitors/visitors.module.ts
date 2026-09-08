import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { VisitorsController } from './visitors.controller';
import { VisitorsService } from './visitors.service';

@Module({
  imports: [
    AuthModule,
    AuditModule,
  ],
  controllers: [
    VisitorsController,
  ],
  providers: [
    VisitorsService,
  ],
})
export class VisitorsModule {}
