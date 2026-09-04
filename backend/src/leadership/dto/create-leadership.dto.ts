import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateLeadershipDto {
  @IsUUID()
  memberId: string;

  @IsOptional()
  @IsUUID()
  ministryId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  roleTitle: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  roleType?: string;

  @IsOptional()
  @IsString()
  responsibility?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  status?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  publicVisible?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
