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

import { FinanceService } from './finance.service';
import { AuditService } from '../audit/audit.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateFinanceTransactionDto } from './dto/create-finance-transaction.dto';
import { UpdateFinanceTransactionDto } from './dto/update-finance-transaction.dto';
import { DateRangeQueryDto } from '../common/dto/date-range-query.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance')
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAll(
    @Query() query: DateRangeQueryDto,
  ) {
    return this.financeService.findAll(
      query.from,
      query.to,
    );
  }

  @Get('summary')
  getSummary(
    @Query() query: DateRangeQueryDto,
  ) {
    return this.financeService.getSummary(
      query.from,
      query.to,
    );
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.financeService.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(
    @Body() body: CreateFinanceTransactionDto,
    @Req() request: any,
  ) {
    const transaction =
      await this.financeService.create(body);

    await this.auditService.log({
      actor: request.user,
      action: 'CREATE',
      module: 'FINANCE',
      entityType: 'FINANCE_TRANSACTION',
      entityId: transaction.id,
      description:
        `Created ${transaction.transaction_type} finance transaction: ${transaction.category}`,
      metadata: {
        transactionDate:
          transaction.transaction_date,
        transactionType:
          transaction.transaction_type,
        category:
          transaction.category,
        amount:
          Number(transaction.amount),
      },
    });

    return transaction;
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateFinanceTransactionDto,
    @Req() request: any,
  ) {
    const transaction =
      await this.financeService.update(
        id,
        body,
      );

    await this.auditService.log({
      actor: request.user,
      action: 'UPDATE',
      module: 'FINANCE',
      entityType: 'FINANCE_TRANSACTION',
      entityId: transaction.id,
      description:
        `Updated ${transaction.transaction_type} finance transaction: ${transaction.category}`,
      metadata: {
        transactionDate:
          transaction.transaction_date,
        transactionType:
          transaction.transaction_type,
        category:
          transaction.category,
        amount:
          Number(transaction.amount),
      },
    });

    return transaction;
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: any,
  ) {
    const transaction =
      await this.financeService.remove(id);

    await this.auditService.log({
      actor: request.user,
      action: 'DELETE',
      module: 'FINANCE',
      entityType: 'FINANCE_TRANSACTION',
      entityId: transaction.id,
      description:
        `Deleted ${transaction.transaction_type} finance transaction: ${transaction.category}`,
      metadata: {
        transactionDate:
          transaction.transaction_date,
        transactionType:
          transaction.transaction_type,
        category:
          transaction.category,
        amount:
          Number(transaction.amount),
      },
    });

    return transaction;
  }
}
