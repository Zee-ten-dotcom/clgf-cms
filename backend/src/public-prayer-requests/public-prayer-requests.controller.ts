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

import { PublicPrayerRequestsService } from './public-prayer-requests.service';

import { CreatePublicPrayerRequestDto } from './dto/create-public-prayer-request.dto';
import { UpdatePublicPrayerRequestDto } from './dto/update-public-prayer-request.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('public-prayer-requests')
export class PublicPrayerRequestsController {
  constructor(
    private readonly publicPrayerRequestsService:
      PublicPrayerRequestsService,
  ) {}

  @Throttle({
    default: {
      limit: 5,
      ttl: 600000,
    },
  })
  @Post()
  create(
    @Body() body: CreatePublicPrayerRequestDto,
  ) {
    return this.publicPrayerRequestsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.publicPrayerRequestsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdatePublicPrayerRequestDto,
  ) {
    return this.publicPrayerRequestsService.updateStatus(
      id,
      body.status!,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.publicPrayerRequestsService.remove(id);
  }
}
