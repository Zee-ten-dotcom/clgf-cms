import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePastoralCareDto {
  @IsUUID()
  memberId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  careType: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsOptional()
  @IsString()
  notes?: string;

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
  assignedLeaderId?: string;

  @IsOptional()
  @IsDateString()
  careDate?: string;

  @IsOptional()
  @IsDateString()
  followUpDate?: string;
}
