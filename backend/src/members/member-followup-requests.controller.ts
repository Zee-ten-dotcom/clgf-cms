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
import {
  IsIn,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuditService } from '../audit/audit.service';
import { MemberFollowupRequestsService } from './member-followup-requests.service';

class FollowupRequestDto {
  @IsUUID()
  memberId!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  reason!: string;
}

class FollowupDecisionDto {
  @IsIn(['APPROVED', 'REJECTED'])
  decision!: 'APPROVED' | 'REJECTED';
}

class LinkCaseDto {
  @IsUUID()
  caseId!: string;
}

@Controller('member-followup-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MemberFollowupRequestsController {
  constructor(
    private readonly requests: MemberFollowupRequestsService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  @Roles('ADMIN', 'LEADER')
  list(@Req() req: any) {
    return this.requests.list(req.user);
  }

  @Post()
  @Roles('ADMIN', 'LEADER')
  async request(
    @Body() body: FollowupRequestDto,
    @Req() req: any,
  ) {
    const result = await this.requests.request(
      body.memberId,
      body.reason,
      req.user,
    );

    await this.audit.log({
      actor: req.user,
      action: 'REQUEST_FOLLOWUP',
      module: 'MEMBERS',
      entityType: 'MEMBER_FOLLOWUP_REQUEST',
      entityId: result.id,
      description: 'Requested member attendance follow-up',
    });

    return result;
  }

  @Patch(':id/link-case')
  @Roles('ADMIN')
  async linkCase(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: LinkCaseDto,
    @Req() req: any,
  ) {
    const result = await this.requests.linkCase(
      id, body.caseId, req.user,
    );

    await this.audit.log({
      actor: req.user,
      action: 'LINK_FOLLOWUP_CASE',
      module: 'MEMBERS',
      entityType: 'MEMBER_FOLLOWUP_REQUEST',
      entityId: result.id,
      description: 'Linked approved request to Pastoral Care case',
    });

    return result;
  }

  @Patch(':id/review')
  @Roles('ADMIN')
  async review(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: FollowupDecisionDto,
    @Req() req: any,
  ) {
    const result = await this.requests.review(
      id,
      body.decision,
      req.user,
    );

    await this.audit.log({
      actor: req.user,
      action:
        body.decision === 'APPROVED'
          ? 'APPROVE_FOLLOWUP_REQUEST'
          : 'REJECT_FOLLOWUP_REQUEST',
      module: 'MEMBERS',
      entityType: 'MEMBER_FOLLOWUP_REQUEST',
      entityId: result.id,
      description: `Follow-up request ${body.decision.toLowerCase()}`,
    });

    return result;
  }
}
