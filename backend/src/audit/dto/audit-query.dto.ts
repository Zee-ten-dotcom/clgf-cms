import {
  Transform,
  Type,
} from 'class-transformer';

import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class AuditQueryDto {
  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @Transform(({ value }) =>
    value === '' ? undefined : value,
  )
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Transform(({ value }) =>
    value === '' ? undefined : value,
  )
  @IsOptional()
  @IsDateString()
  from?: string;

  @Transform(({ value }) =>
    value === '' ? undefined : value,
  )
  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @Transform(({ value }) =>
    value === '' ? undefined : value,
  )
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  limit?: number;

  @Transform(({ value }) =>
    value === '' ? undefined : value,
  )
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  offset?: number;
}
