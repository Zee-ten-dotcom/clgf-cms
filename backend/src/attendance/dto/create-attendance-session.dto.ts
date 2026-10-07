import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateAttendanceSessionDto {
  @IsDateString()
  serviceDate: string;

  @IsString()
  @MinLength(1)
  serviceType: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  homeCellId?: string;
}
