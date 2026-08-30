import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateFinanceTransactionDto {
  @IsDateString()
  transactionDate: string;

  @IsIn(['INCOME', 'EXPENSE'])
  transactionType: string;

  @IsString()
  @MinLength(1)
  category: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
