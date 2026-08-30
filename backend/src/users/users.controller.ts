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

import { UsersService } from './users.service';
import { AuditService } from '../audit/audit.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetUserStatusDto } from './dto/set-user-status.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  async create(
    @Body() body: CreateUserDto,
    @Req() request: any,
  ) {
    const user =
      await this.usersService.create(body);

    await this.auditService.log({
      actor: request.user,
      action: 'CREATE',
      module: 'USERS',
      entityType: 'USER',
      entityId: user.id,
      description:
        `Created CMS user ${user.first_name} ${user.last_name}`,
      metadata: {
        email: user.email,
        role: user.role,
        memberId: user.member_id || null,
      },
    });

    return user;
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateUserDto,
    @Req() request: any,
  ) {
    const user =
      await this.usersService.update(
        id,
        body,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'USERS',
      entityType: 'USER',
      entityId: user.id,
      description:
        `Updated CMS user ${user.first_name} ${user.last_name}`,
      metadata: {
        email: user.email,
        role: user.role,
        memberId: user.member_id || null,
      },
    });

    return user;
  }

  @Patch(':id/status')
  async setStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: SetUserStatusDto,
    @Req() request: any,
  ) {
    const user =
      await this.usersService.setStatus(
        id,
        body.isActive,
        request.user?.sub,
      );

    await this.auditService.log({
      actor: request.user,
      action: body.isActive
        ? 'ACTIVATE'
        : 'DEACTIVATE',
      module: 'USERS',
      entityType: 'USER',
      entityId: user.id,
      description:
        `${body.isActive ? 'Activated' : 'Deactivated'} CMS user ${user.first_name} ${user.last_name}`,
      metadata: {
        email: user.email,
        role: user.role,
        isActive: user.is_active,
      },
    });

    return user;
  }

  @Patch(':id/password')
  async resetPassword(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: ResetPasswordDto,
    @Req() request: any,
  ) {
    const result =
      await this.usersService.resetPassword(
        id,
        body.password,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'PASSWORD_RESET',
      module: 'USERS',
      entityType: 'USER',
      entityId: result.userId,
      description:
        `Reset password for CMS user ${result.email}`,
      metadata: {
        email: result.email,
      },
    });

    return result;
  }
}
