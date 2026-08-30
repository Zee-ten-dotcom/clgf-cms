import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsOptional,
} from 'class-validator';

export class DateRangeQueryDto {
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
}
