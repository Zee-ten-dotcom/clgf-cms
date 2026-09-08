import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { VisitorsService } from './visitors.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import {
  UpdateVisitorFollowUpDto,
} from './dto/update-visitor-follow-up.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('visitors')
export class VisitorsController {
  constructor(
    private readonly visitorsService: VisitorsService,
    private readonly auditService: AuditService,
  ) {}

  @Roles('ADMIN', 'LEADER')
  @Get()
  findAll() {
    return this.visitorsService.findAll();
  }

  @Roles('ADMIN', 'LEADER')
  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.visitorsService.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(
    @Body() body: CreateVisitorDto,
    @Req() request: any,
  ) {
    const visitor =
      await this.visitorsService.create(body);

    await this.auditService.log({
      actor: request.user,
      action: 'CREATE',
      module: 'VISITORS',
      entityType: 'VISITOR',
      entityId: visitor.id,
      description:
        `Created visitor ${visitor.first_name} ${visitor.last_name}`,
      metadata: {
        status: visitor.status,
        followUpStatus: visitor.follow_up_status,
      },
    });

    return visitor;
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateVisitorDto,
    @Req() request: any,
  ) {
    const visitor =
      await this.visitorsService.update(id, body);

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'VISITORS',
      entityType: 'VISITOR',
      entityId: visitor.id,
      description:
        `Updated visitor ${visitor.first_name} ${visitor.last_name}`,
      metadata: {
        status: visitor.status,
        followUpStatus: visitor.follow_up_status,
      },
    });

    return visitor;
  }

  @Roles('ADMIN', 'LEADER')
  @Patch(':id/follow-up')
  async updateFollowUp(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateVisitorFollowUpDto,
    @Req() request: any,
  ) {
    const visitor =
      await this.visitorsService.updateFollowUp(
        id,
        body,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'FOLLOW_UP',
      module: 'VISITORS',
      entityType: 'VISITOR',
      entityId: visitor.id,
      description:
        `Updated visitor follow-up for ${visitor.first_name} ${visitor.last_name}`,
      metadata: {
        followUpStatus: visitor.follow_up_status,
        assignedLeaderId:
          visitor.assigned_leader_id || null,
        visitCount: visitor.visit_count,
      },
    });

    return visitor;
  }

  @Roles('ADMIN')
  @Patch(':id/archive')
  async archive(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    const visitor =
      await this.visitorsService.archive(id);

    await this.auditService.log({
      actor: request.user,
      action: 'ARCHIVE',
      module: 'VISITORS',
      entityType: 'VISITOR',
      entityId: visitor.id,
      description:
        `Archived visitor ${visitor.first_name} ${visitor.last_name}`,
      metadata: {
        status: visitor.status,
      },
    });

    return visitor;
  }

  @Roles('ADMIN')
  @Patch(':id/reactivate')
  async reactivate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    const visitor =
      await this.visitorsService.reactivate(id);

    await this.auditService.log({
      actor: request.user,
      action: 'REACTIVATE',
      module: 'VISITORS',
      entityType: 'VISITOR',
      entityId: visitor.id,
      description:
        `Reactivated visitor ${visitor.first_name} ${visitor.last_name}`,
      metadata: {
        status: visitor.status,
      },
    });

    return visitor;
  }

  @Roles('ADMIN')
  @Post(':id/convert-to-member')
  async convertToMember(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    const result =
      await this.visitorsService.convertToMember(id);

    await this.auditService.log({
      actor: request.user,
      action: 'CONVERT',
      module: 'VISITORS',
      entityType: 'VISITOR',
      entityId: result.visitor.id,
      description:
        `Converted visitor ${result.visitor.first_name} ${result.visitor.last_name} to member`,
      metadata: {
        memberId: result.member.id,
        membershipNumber:
          result.member.membership_number,
      },
    });

    return result;
  }
}
