import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { EventsService } from './events.service';
import { AuditService } from '../audit/audit.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { DateRangeQueryDto } from '../common/dto/date-range-query.dto';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAll(
    @Query() query: DateRangeQueryDto,
  ) {
    return this.eventsService.findAll(
      query.from,
      query.to,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.eventsService.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(
    @Body() body: CreateEventDto,
    @Req() request: any,
  ) {
    const event =
      await this.eventsService.create(body);

    await this.auditService.log({
      actor: request.user,
      action: 'CREATE',
      module: 'EVENTS',
      entityType: 'EVENT',
      entityId: event.id,
      description:
        `Created event: ${event.title}`,
      metadata: {
        eventDate:
          event.event_date,
        eventType:
          event.event_type || null,
        status:
          event.status,
        location:
          event.location || null,
      },
    });

    return event;
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateEventDto,
    @Req() request: any,
  ) {
    const event =
      await this.eventsService.update(
        id,
        body,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'EVENTS',
      entityType: 'EVENT',
      entityId: event.id,
      description:
        `Updated event: ${event.title}`,
      metadata: {
        eventDate:
          event.event_date,
        eventType:
          event.event_type || null,
        status:
          event.status,
        location:
          event.location || null,
      },
    });

    return event;
  }

  @Roles('ADMIN', 'LEADER')
  @Post(':id/attendance')
  async createAttendance(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    const result =
      await this.eventsService
        .createOrGetAttendanceSession(id);

    if (result.created) {
      await this.auditService.log({
        actor: request.user,
        action: 'CREATE_ATTENDANCE_SESSION',
        module: 'EVENTS',
        entityType: 'EVENT',
        entityId: result.event.id,
        description:
          `Created attendance session for event: ${result.event.title}`,
        metadata: {
          attendanceSessionId:
            result.attendanceSession.id,
          eventDate:
            result.event.event_date,
        },
      });
    }

    return result;
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    const event =
      await this.eventsService.remove(id);

    await this.auditService.log({
      actor: request.user,
      action: 'DELETE',
      module: 'EVENTS',
      entityType: 'EVENT',
      entityId: event.id,
      description:
        `Deleted event: ${event.title}`,
      metadata: {
        eventDate:
          event.event_date,
        eventType:
          event.event_type || null,
        status:
          event.status,
      },
    });

    return event;
  }
}
