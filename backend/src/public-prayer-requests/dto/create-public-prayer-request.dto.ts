import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePublicPrayerRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  requesterName: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contact?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(5000)
  prayerRequest: string;

  @IsOptional()
  @IsBoolean()
  confidential?: boolean;
}
