import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { ContactEnquiriesController } from './contact-enquiries.controller';
import { ContactEnquiriesService } from './contact-enquiries.service';

@Module({
  imports: [
    AuthModule,
  ],
  controllers: [
    ContactEnquiriesController,
  ],
  providers: [
    ContactEnquiriesService,
  ],
})
export class ContactEnquiriesModule {}
