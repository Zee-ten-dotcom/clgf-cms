import { Module } from '@nestjs/common';

import { SermonsController } from './sermons.controller';
import { PublicSermonsController } from './public-sermons.controller';
import { SermonsService } from './sermons.service';
import { SermonMediaService } from './sermon-media.service';

import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    AuthModule,
    AuditModule,
  ],
  controllers: [
    SermonsController,
    PublicSermonsController,
  ],
  providers: [
    SermonsService,
    SermonMediaService,
  ],
})
export class SermonsModule {}
