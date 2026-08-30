import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateHomeCellDto {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUUID()
  leaderId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  meetingDay?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  meetingTime?: string;
}
