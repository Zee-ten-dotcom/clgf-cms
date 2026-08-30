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

export class UpdateFinanceTransactionDto {
  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @IsOptional()
  @IsIn(['INCOME', 'EXPENSE'])
  transactionType?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
