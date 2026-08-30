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

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuditService } from '../audit/audit.service';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('members')
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAll() {
    return this.membersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.membersService.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(
    @Body() body: CreateMemberDto,
    @Req() request: any,
  ) {
    const member =
      await this.membersService.create(body);

    await this.auditService.log({
      actor: request.user,
      action: 'CREATE',
      module: 'MEMBERS',
      entityType: 'MEMBER',
      entityId: member.id,
      description:
        `Created member ${member.first_name} ${member.last_name}`,
      metadata: {
        membershipNumber:
          member.membership_number,
        status: member.status,
      },
    });

    return member;
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateMemberDto,
    @Req() request: any,
  ) {
    const member =
      await this.membersService.update(
        id,
        body,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'MEMBERS',
      entityType: 'MEMBER',
      entityId: member.id,
      description:
        `Updated member ${member.first_name} ${member.last_name}`,
      metadata: {
        membershipNumber:
          member.membership_number,
        status: member.status,
      },
    });

    return member;
  }

  @Roles('ADMIN')
  @Patch(':id/deactivate')
  async deactivate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    const member =
      await this.membersService.deactivate(id);

    await this.auditService.log({
      actor: request.user,
      action: 'DEACTIVATE',
      module: 'MEMBERS',
      entityType: 'MEMBER',
      entityId: member.id,
      description:
        `Deactivated member ${member.first_name} ${member.last_name}`,
      metadata: {
        membershipNumber:
          member.membership_number,
        status: member.status,
      },
    });

    return member;
  }

  @Roles('ADMIN')
  @Patch(':id/reactivate')
  async reactivate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    const member =
      await this.membersService.reactivate(id);

    await this.auditService.log({
      actor: request.user,
      action: 'REACTIVATE',
      module: 'MEMBERS',
      entityType: 'MEMBER',
      entityId: member.id,
      description:
        `Reactivated member ${member.first_name} ${member.last_name}`,
      metadata: {
        membershipNumber:
          member.membership_number,
        status: member.status,
      },
    });

    return member;
  }
}
