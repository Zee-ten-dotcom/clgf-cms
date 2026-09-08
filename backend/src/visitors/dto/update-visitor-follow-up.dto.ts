import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateVisitorFollowUpDto {
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
  @IsDateString()
  lastVisitDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  visitCount?: number;
}
