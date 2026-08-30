import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class LeadershipQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @Transform(({ value }) =>
    value === '' ? undefined : value,
  )
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Transform(({ value }) =>
    value === '' ? undefined : value,
  )
  @IsOptional()
  @IsUUID()
  ministryId?: string;
}
