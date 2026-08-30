import { Module } from '@nestjs/common';

import { HomeCellsController } from './home-cells.controller';
import { HomeCellsService } from './home-cells.service';

import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    AuthModule,
    AuditModule,
  ],
  controllers: [
    HomeCellsController,
  ],
  providers: [
    HomeCellsService,
  ],
})
export class HomeCellsModule {}
