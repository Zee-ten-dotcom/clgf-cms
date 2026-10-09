import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum FollowUpMethod {
  PHONE = 'PHONE',
  HOME_VISIT = 'HOME_VISIT',
  CHURCH_MEETING = 'CHURCH_MEETING',
  PRAYER = 'PRAYER',
  MESSAGE = 'MESSAGE',
  OTHER = 'OTHER',
}

export enum FollowUpOutcome {
  SUCCESSFUL = 'SUCCESSFUL',
  NO_ANSWER = 'NO_ANSWER',
  RESCHEDULED = 'RESCHEDULED',
  NEEDS_SUPPORT = 'NEEDS_SUPPORT',
}

export class CreatePastoralFollowUpDto {
  @IsDateString()
  followUpDate: string;

  @IsEnum(FollowUpMethod)
  contactMethod: FollowUpMethod;

  @IsEnum(FollowUpOutcome)
  outcome: FollowUpOutcome;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @IsOptional()
  @IsDateString()
  nextFollowUpDate?: string;
}
