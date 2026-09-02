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

import { SermonsService } from './sermons.service';
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
