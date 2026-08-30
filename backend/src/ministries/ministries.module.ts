import { Module } from '@nestjs/common';

import { MinistriesController } from './ministries.controller';
import { MinistriesService } from './ministries.service';

import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    AuthModule,
    AuditModule,
  ],
  controllers: [
    MinistriesController,
  ],
  providers: [
    MinistriesService,
  ],
})
export class MinistriesModule {}
