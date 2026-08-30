import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { HomeCellsService } from './home-cells.service';
import { AuditService } from '../audit/audit.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { CreateHomeCellDto } from './dto/create-home-cell.dto';
import { UpdateHomeCellDto } from './dto/update-home-cell.dto';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('home-cells')
export class HomeCellsController {
  constructor(
    private readonly homeCellsService: HomeCellsService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAll() {
    return this.homeCellsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.homeCellsService.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(
    @Body() body: CreateHomeCellDto,
    @Req() request: any,
  ) {
    const homeCell =
      await this.homeCellsService.create(body);

    await this.auditService.log({
      actor: request.user,
      action: 'CREATE',
      module: 'HOME_CELLS',
      entityType: 'HOME_CELL',
      entityId: homeCell.id,
      description:
        `Created home cell: ${homeCell.name}`,
      metadata: {
        name: homeCell.name,
        location: homeCell.location || null,
        leaderId: homeCell.leader_id || null,
        meetingDay: homeCell.meeting_day || null,
        meetingTime: homeCell.meeting_time || null,
      },
    });

    return homeCell;
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateHomeCellDto,
    @Req() request: any,
  ) {
    const homeCell =
      await this.homeCellsService.update(
        id,
        body,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'HOME_CELLS',
      entityType: 'HOME_CELL',
      entityId: homeCell.id,
      description:
        `Updated home cell: ${homeCell.name}`,
      metadata: {
        name: homeCell.name,
        location: homeCell.location || null,
        leaderId: homeCell.leader_id || null,
        meetingDay: homeCell.meeting_day || null,
        meetingTime: homeCell.meeting_time || null,
      },
    });

    return homeCell;
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    const homeCell =
      await this.homeCellsService.remove(id);

    await this.auditService.log({
      actor: request.user,
      action: 'DELETE',
      module: 'HOME_CELLS',
      entityType: 'HOME_CELL',
      entityId: homeCell.id,
      description:
        `Deleted home cell: ${homeCell.name}`,
      metadata: {
        name: homeCell.name,
        location: homeCell.location || null,
        leaderId: homeCell.leader_id || null,
      },
    });

    return homeCell;
  }
}
