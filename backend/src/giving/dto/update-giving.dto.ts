import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateGivingDto {
  @IsOptional()
  @IsUUID()
  memberId?: string | null;

  @IsOptional()
  @IsDateString()
  givingDate?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  givingType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string | null;

  @IsOptional()
  @IsString()
  referenceNumber?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
