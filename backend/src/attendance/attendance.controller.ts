import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { AttendanceService } from './attendance.service';
import { AuditService } from '../audit/audit.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { CreateAttendanceSessionDto } from './dto/create-attendance-session.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { DateRangeQueryDto } from '../common/dto/date-range-query.dto';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAllSessions() {
    return this.attendanceService.findAllSessions();
  }

  @Get('member/:memberId/history')
  getMemberHistory(
    @Param('memberId', new ParseUUIDPipe()) memberId: string,
  ) {
    return this.attendanceService.getMemberHistory(
      memberId,
    );
  }

  @Get('report')
  getAttendanceReport(
    @Query() query: DateRangeQueryDto,
  ) {
    return this.attendanceService.getAttendanceReport(
      query.from,
      query.to,
    );
  }

  @Get(':id')
  findSession(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.attendanceService.findSession(id);
  }

  @Roles('ADMIN')
  @Post()
  async createSession(
    @Body() body: CreateAttendanceSessionDto,
    @Req() request: any,
  ) {
    const session =
      await this.attendanceService.createSession(body);

    await this.auditService.log({
      actor: request.user,
      action: 'CREATE_SESSION',
      module: 'ATTENDANCE',
      entityType: 'ATTENDANCE_SESSION',
      entityId: session.id,
      description:
        `Created attendance session: ${session.service_type}`,
      metadata: {
        serviceDate:
          session.service_date,
        serviceType:
          session.service_type,
      },
    });

    return session;
  }

  @Roles('ADMIN', 'LEADER')
  @Post(':sessionId/members')
  async markAttendance(
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Body() body: MarkAttendanceDto,
    @Req() request: any,
  ) {
    const record =
      await this.attendanceService.markAttendance(
        sessionId,
        body,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'MARK_ATTENDANCE',
      module: 'ATTENDANCE',
      entityType: 'ATTENDANCE_RECORD',
      entityId: record.id,
      description:
        `Marked member attendance as ${record.status}`,
      metadata: {
        sessionId:
          record.session_id,
        memberId:
          record.member_id,
        status:
          record.status,
      },
    });

    return record;
  }

  @Roles('ADMIN', 'LEADER')
  @Delete(':sessionId/members/:memberId')
  async removeAttendance(
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Param('memberId', new ParseUUIDPipe()) memberId: string,
    @Req() request: any,
  ) {
    const record =
      await this.attendanceService.removeAttendance(
        sessionId,
        memberId,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'REMOVE_ATTENDANCE',
      module: 'ATTENDANCE',
      entityType: 'ATTENDANCE_RECORD',
      entityId: record.id,
      description:
        'Removed member attendance record',
      metadata: {
        sessionId:
          record.session_id,
        memberId:
          record.member_id,
        status:
          record.status,
      },
    });

    return record;
  }

  @Roles('ADMIN')
  @Delete(':id')
  async removeSession(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    const session =
      await this.attendanceService.removeSession(id);

    await this.auditService.log({
      actor: request.user,
      action: 'DELETE_SESSION',
      module: 'ATTENDANCE',
      entityType: 'ATTENDANCE_SESSION',
      entityId: session.id,
      description:
        `Deleted attendance session: ${session.service_type}`,
      metadata: {
        serviceDate:
          session.service_date,
        serviceType:
          session.service_type,
      },
    });

    return session;
  }
}
