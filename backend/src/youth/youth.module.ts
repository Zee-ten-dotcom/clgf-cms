import { Module } from '@nestjs/common';
import { YouthController } from './youth.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [YouthController],
})
export class YouthModule {}
