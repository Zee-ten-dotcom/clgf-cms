import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreateVisitorDto {
  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  firstVisitDate?: string;

  @IsOptional()
  @IsDateString()
  lastVisitDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  visitCount?: number;

  @IsOptional()
  @IsString()
  invitedBy?: string;

  @IsOptional()
  @IsString()
  visitContext?: string;

  @IsOptional()
  @IsString()
  followUpStatus?: string;

  @IsOptional()
  @IsUUID()
  assignedLeaderId?: string;

  @IsOptional()
  @IsString()
  followUpNotes?: string;

  @IsOptional()
  @IsBoolean()
  membershipInterest?: boolean;
}
