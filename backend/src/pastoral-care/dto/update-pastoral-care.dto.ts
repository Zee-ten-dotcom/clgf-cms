import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdatePastoralCareDto {
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  careType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  priority?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  status?: string;

  @IsOptional()
  @IsUUID()
  assignedLeaderId?: string | null;

  @IsOptional()
  @IsDateString()
  careDate?: string;

  @IsOptional()
  @IsDateString()
  followUpDate?: string | null;
}
