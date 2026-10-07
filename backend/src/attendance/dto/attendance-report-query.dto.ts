import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class AttendanceReportQueryDto {
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

  @Transform(({ value }) =>
    value === '' ? undefined : value,
  )
  @IsOptional()
  @IsUUID()
  homeCellId?: string;
}
