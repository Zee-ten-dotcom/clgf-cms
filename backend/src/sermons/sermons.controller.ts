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

import { SermonsService } from './sermons.service';
import { SermonMediaService } from './sermon-media.service';
import { AuditService } from '../audit/audit.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { CreateSermonDto } from './dto/create-sermon.dto';
import { UpdateSermonDto } from './dto/update-sermon.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sermons')
export class SermonsController {
  constructor(
    private readonly sermonsService: SermonsService,
    private readonly auditService: AuditService,
    private readonly sermonMediaService: SermonMediaService,
  ) {}

  @Get()
  findAll() {
    return this.sermonsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.sermonsService.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(
    @Body() body: CreateSermonDto,
    @Req() request: any,
  ) {
    const sermon =
      await this.sermonsService.create(body);

    await this.auditService.log({
      actor: request.user,
      action: 'CREATE',
      module: 'SERMONS',
      entityType: 'SERMON',
      entityId: sermon.id,
      description:
        `Created sermon: ${sermon.title}`,
      metadata: {
        sermonDate: sermon.sermon_date,
        speaker: sermon.speaker,
        status: sermon.status,
        featured: sermon.featured,
      },
    });

    return sermon;
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateSermonDto,
    @Req() request: any,
  ) {
    const sermon =
      await this.sermonsService.update(id, body);

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'SERMONS',
      entityType: 'SERMON',
      entityId: sermon.id,
      description:
        `Updated sermon: ${sermon.title}`,
      metadata: {
        sermonDate: sermon.sermon_date,
        speaker: sermon.speaker,
        status: sermon.status,
        featured: sermon.featured,
      },
    });

    return sermon;
  }

  @Roles('ADMIN')
  @Post(':id/notes')
  @UseInterceptors(
    FileInterceptor('notes', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  async uploadNotes(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: any,
  ) {
    if (!file) {
      throw new BadRequestException(
        'PDF notes file is required',
      );
    }

    await this.sermonsService.findOne(id);

    const url =
      await this.sermonMediaService.uploadNotes(
        id,
        file,
      );

    const sermon =
      await this.sermonsService.updateMediaUrl(
        id,
        'notes',
        url,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'SERMONS',
      entityType: 'SERMON',
      entityId: sermon.id,
      description: 'Uploaded sermon notes',
      metadata: {
        mediaType: 'notes',
      },
    });

    return {
      id: sermon.id,
      notes_url: sermon.notes_url,
    };
  }

  @Roles('ADMIN')
  @Delete(':id/notes')
  async removeNotes(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    await this.sermonsService.findOne(id);
    await this.sermonMediaService.removeNotes(id);

    const sermon =
      await this.sermonsService.updateMediaUrl(
        id,
        'notes',
        null,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'SERMONS',
      entityType: 'SERMON',
      entityId: sermon.id,
      description: 'Removed sermon notes',
      metadata: {
        mediaType: 'notes',
      },
    });

    return {
      id: sermon.id,
      notes_url: null,
    };
  }

  @Roles('ADMIN')
  @Post(':id/audio')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: memoryStorage(),
      limits: {
        fileSize: 25 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  async uploadAudio(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: any,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Audio file is required',
      );
    }

    await this.sermonsService.findOne(id);

    const url =
      await this.sermonMediaService.uploadAudio(
        id,
        file,
      );

    const sermon =
      await this.sermonsService.updateMediaUrl(
        id,
        'audio',
        url,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'SERMONS',
      entityType: 'SERMON',
      entityId: sermon.id,
      description: 'Uploaded sermon audio',
      metadata: {
        mediaType: 'audio',
      },
    });

    return {
      id: sermon.id,
      audio_url: sermon.audio_url,
    };
  }

  @Roles('ADMIN')
  @Delete(':id/audio')
  async removeAudio(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    await this.sermonsService.findOne(id);
    await this.sermonMediaService.removeAudio(id);

    const sermon =
      await this.sermonsService.updateMediaUrl(
        id,
        'audio',
        null,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'SERMONS',
      entityType: 'SERMON',
      entityId: sermon.id,
      description: 'Removed sermon audio',
      metadata: {
        mediaType: 'audio',
      },
    });

    return {
      id: sermon.id,
      audio_url: null,
    };
  }

  @Roles('ADMIN')
  @Post(':id/video')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024,
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
        'Video file is required',
      );
    }

    await this.sermonsService.findOne(id);

    const url =
      await this.sermonMediaService.uploadVideo(
        id,
        file,
      );

    const sermon =
      await this.sermonsService.updateMediaUrl(
        id,
        'video',
        url,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'SERMONS',
      entityType: 'SERMON',
      entityId: sermon.id,
      description: 'Uploaded sermon video',
      metadata: {
        mediaType: 'video',
      },
    });

    return {
      id: sermon.id,
      video_url: sermon.video_url,
    };
  }

  @Roles('ADMIN')
  @Delete(':id/video')
  async removeVideo(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    await this.sermonsService.findOne(id);
    await this.sermonMediaService.removeVideo(id);

    const sermon =
      await this.sermonsService.updateMediaUrl(
        id,
        'video',
        null,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'SERMONS',
      entityType: 'SERMON',
      entityId: sermon.id,
      description: 'Removed sermon video',
      metadata: {
        mediaType: 'video',
      },
    });

    return {
      id: sermon.id,
      video_url: null,
    };
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    const sermon =
      await this.sermonsService.remove(id);

    await this.auditService.log({
      actor: request.user,
      action: 'DELETE',
      module: 'SERMONS',
      entityType: 'SERMON',
      entityId: sermon.id,
      description:
        `Deleted sermon: ${sermon.title}`,
      metadata: {
        sermonDate: sermon.sermon_date,
        speaker: sermon.speaker,
        status: sermon.status,
      },
    });

    return sermon;
  }
}
