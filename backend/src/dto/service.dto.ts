import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ description: 'Service name', example: 'Classic Haircut' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Service description',
    example: 'Traditional haircut with scissor and clipper work',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Base price in dollars', example: 35.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ description: 'Duration in minutes', example: 45 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  durationMinutes: number;

  @ApiProperty({ description: 'Service category', example: 'Haircuts' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiPropertyOptional({
    description: 'Service image URL',
    example: '/images/classic-cut.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;
}

export class UpdateServiceDto {
  @ApiPropertyOptional({ description: 'Service name', example: 'Premium Cut' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Service description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Base price in dollars' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Service category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Service image URL' })
  @IsOptional()
  @IsString()
  image?: string;
}
