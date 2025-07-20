import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsString,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek, type DayOfWeekType } from '../schema';

export class CreateAvailabilityDto {
  @ApiProperty({ description: 'Barber ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  barberId: number;

  @ApiProperty({
    description: 'Day of the week',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
  })
  @IsNotEmpty()
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeekType;

  @ApiProperty({
    description: 'Start time (HH:MM format)',
    example: '09:00',
  })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({
    description: 'End time (HH:MM format)',
    example: '17:00',
  })
  @IsNotEmpty()
  @IsString()
  endTime: string;
}

export class UpdateAvailabilityDto {
  @ApiPropertyOptional({
    description: 'Day of the week',
    enum: DayOfWeek,
  })
  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeekType;

  @ApiPropertyOptional({
    description: 'Start time (HH:MM format)',
    example: '08:00',
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({
    description: 'End time (HH:MM format)',
    example: '18:00',
  })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
