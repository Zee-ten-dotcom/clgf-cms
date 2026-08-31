import {
  IsIn,
  IsString,
} from 'class-validator';

export class UpdatePublicPrayerRequestDto {
  @IsString()
  @IsIn([
    'OPEN',
    'IN_PROGRESS',
    'PRAYED_FOR',
    'FOLLOW_UP',
    'CLOSED',
  ])
  status: string;
}
