import { Module } from '@nestjs/common';

import { HomeCellsController } from './home-cells.controller';
import { PublicHomeCellsController } from './public-home-cells.controller';
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
    PublicHomeCellsController,
  ],
  providers: [
    HomeCellsService,
  ],
})
export class HomeCellsModule {}
