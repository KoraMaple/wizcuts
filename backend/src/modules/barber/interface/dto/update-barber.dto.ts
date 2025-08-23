import {
  IsOptional,
  IsString,
  IsNumber,
  IsNumberString,
  IsArray,
  IsBoolean,
  IsEmail,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBarberDto {
  @ApiPropertyOptional({
    description: 'Barber name',
    example: 'Michael Rodriguez',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Barber title',
    example: 'Senior Barber',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Barber biography' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Barber profile image URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Years of experience' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  experienceYears?: number;

  @ApiPropertyOptional({ description: 'Barber specialties' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Rating', minimum: 0, maximum: 5 })
  @IsOptional()
  @IsNumberString()
  rating?: string;

  @ApiPropertyOptional({ description: 'Review count' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reviewCount?: number;
}
