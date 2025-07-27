import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEmail,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBarberDto {
  @ApiProperty({ description: 'Barber name', example: 'Michael Rodriguez' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Barber title', example: 'Master Barber' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Barber biography',
    example: 'Experienced barber with 10+ years in the industry',
  })
  @IsNotEmpty()
  @IsString()
  bio: string;

  @ApiProperty({
    description: 'Barber profile image URL',
    example: '/images/barber1.jpg',
  })
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiPropertyOptional({ description: 'Years of experience', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  experienceYears?: number;

  @ApiPropertyOptional({
    description: 'Barber specialties',
    example: ['Classic Cuts', 'Beard Styling'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({ description: 'Phone number', example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'michael@wizcuts.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}

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
