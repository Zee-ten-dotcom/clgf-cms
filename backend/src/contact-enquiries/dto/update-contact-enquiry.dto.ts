import {
  IsIn,
  IsString,
} from 'class-validator';

export class UpdateContactEnquiryDto {
  @IsString()
  @IsIn([
    'NEW',
    'IN_PROGRESS',
    'RESPONDED',
    'CLOSED',
  ])
  status: string;
}
