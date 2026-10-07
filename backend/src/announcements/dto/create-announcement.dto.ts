import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  announcementType?: string;

  @IsDateString()
  publishDate: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  publicVisible?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsIn([
    'EVERYONE',
    'LEADERS',
    'HOME_CELL',
    'SELECTED_MEMBERS',
  ])
  notificationTarget?: string;

  @IsOptional()
  @IsUUID()
  targetHomeCellId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  targetMemberIds?: string[];
}
