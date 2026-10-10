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
import { IsIn, IsString, IsUUID, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuditService } from '../audit/audit.service';
import { MemberTransfersService } from './member-transfers.service';

class TransferRequestDto {
  @IsUUID()
  memberId!: string;

  @IsUUID()
  toHomeCellId!: string;

  @IsString()
  @MaxLength(2000)
  reason!: string;
}

class TransferDecisionDto {
  @IsIn(['APPROVED', 'REJECTED'])
  decision!: 'APPROVED' | 'REJECTED';
}

@Controller('member-transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MemberTransfersController {
  constructor(
    private readonly transfers: MemberTransfersService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  @Roles('ADMIN', 'LEADER')
  list(@Req() req: any) {
    return this.transfers.list(req.user);
  }

  @Post()
  @Roles('ADMIN', 'LEADER')
  async request(@Body() body: TransferRequestDto, @Req() req: any) {
    const result = await this.transfers.request(
      body.memberId,
      body.toHomeCellId,
      body.reason,
      req.user,
    );
    await this.audit.log({
      actor: req.user,
      action: 'REQUEST_TRANSFER',
      module: 'MEMBERS',
      entityType: 'MEMBER_TRANSFER',
      entityId: result.id,
      description: 'Requested member Home Cell transfer',
    });
    return result;
  }

  @Patch(':id/review')
  @Roles('ADMIN')
  async review(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: TransferDecisionDto,
    @Req() req: any,
  ) {
    const result = await this.transfers.review(
      id, body.decision, req.user,
    );
    await this.audit.log({
      actor: req.user,
      action: body.decision === 'APPROVED'
        ? 'APPROVE_TRANSFER' : 'REJECT_TRANSFER',
      module: 'MEMBERS',
      entityType: 'MEMBER_TRANSFER',
      entityId: result.id,
      description: `Member transfer ${body.decision.toLowerCase()}`,
    });
    return result;
  }
}
