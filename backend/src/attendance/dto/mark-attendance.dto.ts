import {
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class MarkAttendanceDto {
  @IsUUID()
  memberId: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  status?: string;
}
