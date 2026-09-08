import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateChurchSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  churchName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  shortName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  scripture?: string;

  @IsOptional()
  @IsString()
  mission?: string;

  @IsOptional()
  @IsString()
  vision?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  motto?: string;

  @ValidateIf((_, value) =>
    value !== undefined && value !== ''
  )
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @ValidateIf((_, value) =>
    value !== undefined && value !== ''
  )
  @IsUrl({
    require_protocol: true,
  })
  @MaxLength(500)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;
}
