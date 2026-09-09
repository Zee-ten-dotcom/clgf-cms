import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import {
  ChurchActivitiesService,
} from './church-activities.service';
import {
  ChurchActivityMediaService,
} from './church-activity-media.service';

import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import {
  CreateChurchActivityDto,
} from './dto/create-church-activity.dto';
import {
  UpdateChurchActivityDto,
} from './dto/update-church-activity.dto';
import {
  UpdateActivityMediaDto,
} from './dto/update-activity-media.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('church-activities')
export class ChurchActivitiesController {
  constructor(
    private readonly churchActivitiesService:
      ChurchActivitiesService,
    private readonly activityMediaService:
      ChurchActivityMediaService,
    private readonly auditService: AuditService,
  ) {}

  @Roles('ADMIN', 'LEADER')
  @Get()
  findAll() {
    return this.churchActivitiesService.findAll();
  }

  @Roles('ADMIN', 'LEADER')
  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.churchActivitiesService.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(
    @Body() body: CreateChurchActivityDto,
    @Req() request: any,
  ) {
    const activity =
      await this.churchActivitiesService.create(body);

    await this.auditService.log({
      actor: request.user,
      action: 'CREATE',
      module: 'CHURCH_ACTIVITIES',
      entityType: 'CHURCH_ACTIVITY',
      entityId: activity.id,
      description:
        `Created church activity: ${activity.title}`,
      metadata: {
        activityDate: activity.activity_date,
        status: activity.status,
        featured: activity.featured,
      },
    });

    return activity;
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateChurchActivityDto,
    @Req() request: any,
  ) {
    const activity =
      await this.churchActivitiesService.update(
        id,
        body,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'CHURCH_ACTIVITIES',
      entityType: 'CHURCH_ACTIVITY',
      entityId: activity.id,
      description:
        `Updated church activity: ${activity.title}`,
      metadata: {
        activityDate: activity.activity_date,
        status: activity.status,
        featured: activity.featured,
      },
    });

    return activity;
  }

  @Roles('ADMIN')
  @Post(':id/photos')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  async uploadPhoto(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: any,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Activity photo is required',
      );
    }

    const activity =
      await this.churchActivitiesService.findOne(id);

    const uploaded =
      await this.activityMediaService.uploadPhoto(
        id,
        file,
      );

    let media;

    try {
      media =
        await this.churchActivitiesService.addMedia({
          activityId: id,
          mediaType: 'PHOTO',
          mediaUrl: uploaded.url,
          cloudinaryPublicId:
            uploaded.publicId,
        });
    } catch (error) {
      await this.activityMediaService.remove(
        uploaded.publicId,
        'PHOTO',
      );

      throw error;
    }

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'CHURCH_ACTIVITIES',
      entityType: 'CHURCH_ACTIVITY',
      entityId: id,
      description:
        `Uploaded photo for activity: ${activity.title}`,
      metadata: {
        mediaId: media.id,
        mediaType: 'PHOTO',
      },
    });

    return media;
  }

  @Roles('ADMIN')
  @Post(':id/videos')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: memoryStorage(),
      limits: {
        fileSize: 25 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  async uploadVideo(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: any,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Activity video is required',
      );
    }

    const activity =
      await this.churchActivitiesService.findOne(id);

    const uploaded =
      await this.activityMediaService.uploadVideo(
        id,
        file,
      );

    let media;

    try {
      media =
        await this.churchActivitiesService.addMedia({
          activityId: id,
          mediaType: 'VIDEO',
          mediaUrl: uploaded.url,
          cloudinaryPublicId:
            uploaded.publicId,
        });
    } catch (error) {
      await this.activityMediaService.remove(
        uploaded.publicId,
        'VIDEO',
      );

      throw error;
    }

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'CHURCH_ACTIVITIES',
      entityType: 'CHURCH_ACTIVITY',
      entityId: id,
      description:
        `Uploaded video for activity: ${activity.title}`,
      metadata: {
        mediaId: media.id,
        mediaType: 'VIDEO',
      },
    });

    return media;
  }

  @Roles('ADMIN')
  @Patch('media/:mediaId')
  async updateMedia(
    @Param('mediaId', new ParseUUIDPipe())
    mediaId: string,
    @Body() body: UpdateActivityMediaDto,
    @Req() request: any,
  ) {
    const media =
      await this.churchActivitiesService.updateMedia(
        mediaId,
        body,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'CHURCH_ACTIVITIES',
      entityType: 'CHURCH_ACTIVITY_MEDIA',
      entityId: media.id,
      description: 'Updated church activity media',
      metadata: {
        activityId: media.activity_id,
        mediaType: media.media_type,
      },
    });

    return media;
  }

  @Roles('ADMIN')
  @Delete('media/:mediaId')
  async removeMedia(
    @Param('mediaId', new ParseUUIDPipe())
    mediaId: string,
    @Req() request: any,
  ) {
    const media =
      await this.churchActivitiesService.findMedia(
        mediaId,
      );

    await this.activityMediaService.remove(
      media.cloudinary_public_id,
      media.media_type,
    );

    const removed =
      await this.churchActivitiesService.removeMediaRecord(
        mediaId,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'DELETE',
      module: 'CHURCH_ACTIVITIES',
      entityType: 'CHURCH_ACTIVITY_MEDIA',
      entityId: removed.id,
      description: 'Removed church activity media',
      metadata: {
        activityId: removed.activity_id,
        mediaType: removed.media_type,
      },
    });

    return removed;
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    const activity =
      await this.churchActivitiesService.findOne(id);

    for (const media of activity.media || []) {
      await this.activityMediaService.remove(
        media.cloudinary_public_id,
        media.media_type,
      );
    }

    const removed =
      await this.churchActivitiesService.remove(id);

    await this.auditService.log({
      actor: request.user,
      action: 'DELETE',
      module: 'CHURCH_ACTIVITIES',
      entityType: 'CHURCH_ACTIVITY',
      entityId: removed.id,
      description:
        `Deleted church activity: ${removed.title}`,
      metadata: {
        activityDate: removed.activity_date,
      },
    });

    return removed;
  }
}
