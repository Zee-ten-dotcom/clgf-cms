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

import { GivingService } from './giving.service';
import { AuditService } from '../audit/audit.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateGivingDto } from './dto/create-giving.dto';
import { UpdateGivingDto } from './dto/update-giving.dto';
import { DateRangeQueryDto } from '../common/dto/date-range-query.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('giving')
export class GivingController {
  constructor(
    private readonly givingService: GivingService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAll(
    @Query() query: DateRangeQueryDto,
  ) {
    return this.givingService.findAll(
      query.from,
      query.to,
    );
  }

  @Get('summary')
  getSummary(
    @Query() query: DateRangeQueryDto,
  ) {
    return this.givingService.getSummary(
      query.from,
      query.to,
    );
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.givingService.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(
    @Body() body: CreateGivingDto,
    @Req() request: any,
  ) {
    const giving =
      await this.givingService.create(body);

    await this.auditService.log({
      actor: request.user,
      action: 'CREATE',
      module: 'GIVING',
      entityType: 'GIVING_RECORD',
      entityId: giving.id,
      description:
        `Created giving record: ${giving.giving_type}`,
      metadata: {
        memberId:
          giving.member_id || null,
        givingDate:
          giving.giving_date,
        givingType:
          giving.giving_type,
        amount:
          Number(giving.amount),
        paymentMethod:
          giving.payment_method || null,
        referenceNumber:
          giving.reference_number || null,
        financeTransactionId:
          giving.finance_transaction_id || null,
      },
    });

    return giving;
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateGivingDto,
    @Req() request: any,
  ) {
    const giving =
      await this.givingService.update(
        id,
        body,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'GIVING',
      entityType: 'GIVING_RECORD',
      entityId: giving.id,
      description:
        `Updated giving record: ${giving.giving_type}`,
      metadata: {
        memberId:
          giving.member_id || null,
        givingDate:
          giving.giving_date,
        givingType:
          giving.giving_type,
        amount:
          Number(giving.amount),
        paymentMethod:
          giving.payment_method || null,
        referenceNumber:
          giving.reference_number || null,
        financeTransactionId:
          giving.finance_transaction_id || null,
      },
    });

    return giving;
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    const giving =
      await this.givingService.remove(id);

    await this.auditService.log({
      actor: request.user,
      action: 'DELETE',
      module: 'GIVING',
      entityType: 'GIVING_RECORD',
      entityId: giving.id,
      description:
        `Deleted giving record: ${giving.giving_type}`,
      metadata: {
        memberId:
          giving.member_id || null,
        givingDate:
          giving.giving_date,
        givingType:
          giving.giving_type,
        amount:
          Number(giving.amount),
        paymentMethod:
          giving.payment_method || null,
        referenceNumber:
          giving.reference_number || null,
        financeTransactionId:
          giving.finance_transaction_id || null,
      },
    });

    return giving;
  }
}
