import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Throttle } from '@nestjs/throttler';

import { ContactEnquiriesService } from './contact-enquiries.service';
import { CreateContactEnquiryDto } from './dto/create-contact-enquiry.dto';
import { UpdateContactEnquiryDto } from './dto/update-contact-enquiry.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('contact-enquiries')
export class ContactEnquiriesController {
  constructor(
    private readonly contactEnquiriesService:
      ContactEnquiriesService,
  ) {}

  @Throttle({
    default: {
      limit: 5,
      ttl: 600000,
    },
  })
  @Post()
  create(
    @Body() body: CreateContactEnquiryDto,
  ) {
    return this.contactEnquiriesService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.contactEnquiriesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateContactEnquiryDto,
  ) {
    return this.contactEnquiriesService.updateStatus(
      id,
      body.status,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.contactEnquiriesService.remove(id);
  }
}
