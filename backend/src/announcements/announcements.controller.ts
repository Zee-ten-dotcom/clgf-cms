import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AnnouncementsService } from './announcements.service';
import { AuditService } from '../audit/audit.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(
    private readonly announcementsService: AnnouncementsService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAll() {
    return this.announcementsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.announcementsService.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(
    @Body() body: CreateAnnouncementDto,
    @Req() request: any,
  ) {
    const announcement =
      await this.announcementsService.create(body);

    await this.auditService.log({
      actor: request.user,
      action: 'CREATE',
      module: 'ANNOUNCEMENTS',
      entityType: 'ANNOUNCEMENT',
      entityId: announcement.id,
      description: `Created announcement: ${announcement.title}`,
      metadata: {
        title: announcement.title,
        announcementType: announcement.announcement_type,
        publishDate: announcement.publish_date,
        expiryDate: announcement.expiry_date,
        status: announcement.status,
        publicVisible: announcement.public_visible,
        displayOrder: announcement.display_order,
      },
    });

    return announcement;
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateAnnouncementDto,
    @Req() request: any,
  ) {
    const announcement =
      await this.announcementsService.update(id, body);

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'ANNOUNCEMENTS',
      entityType: 'ANNOUNCEMENT',
      entityId: announcement.id,
      description: `Updated announcement: ${announcement.title}`,
      metadata: {
        title: announcement.title,
        announcementType: announcement.announcement_type,
        publishDate: announcement.publish_date,
        expiryDate: announcement.expiry_date,
        status: announcement.status,
        publicVisible: announcement.public_visible,
        displayOrder: announcement.display_order,
      },
    });

    return announcement;
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    const announcement =
      await this.announcementsService.remove(id);

    await this.auditService.log({
      actor: request.user,
      action: 'DELETE',
      module: 'ANNOUNCEMENTS',
      entityType: 'ANNOUNCEMENT',
      entityId: announcement.id,
      description: `Deleted announcement: ${announcement.title}`,
      metadata: {
        title: announcement.title,
        announcementType: announcement.announcement_type,
      },
    });

    return announcement;
  }
}
