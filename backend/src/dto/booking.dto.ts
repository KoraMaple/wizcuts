import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsDateString,
  IsEnum,
  Min,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus, type BookingStatusType } from '../schema';

export class CreateBookingDto {
  @ApiProperty({ description: 'Barber ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  barberId: number;

  @ApiProperty({
    description: 'Customer name',
    example: 'John Smith',
  })
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'john@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  customerEmail: string;

  @ApiProperty({
    description: 'Customer phone',
    example: '+1234567890',
  })
  @IsNotEmpty()
  @IsString()
  customerPhone: string;

  @ApiProperty({
    description: 'Service name',
    example: 'Classic Haircut',
  })
  @IsNotEmpty()
  @IsString()
  serviceName: string;

  @ApiProperty({ description: 'Total price', example: '35.00' })
  @IsNotEmpty()
  @IsNumberString()
  totalPrice: string;

  @ApiProperty({ description: 'Duration in minutes', example: 45 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  durationMinutes: number;

  @ApiProperty({
    description: 'Appointment date and time',
    example: '2024-01-15T10:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  appointmentDateTime: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Customer prefers short sides',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBookingDto {
  @ApiPropertyOptional({ description: 'Booking status' })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatusType;

  @ApiPropertyOptional({ description: 'Appointment date and time' })
  @IsOptional()
  @IsDateString()
  appointmentDateTime?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BookingQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by barber ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  barberId?: number;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: BookingStatus,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatusType;

  @ApiPropertyOptional({
    description: 'Start date for filtering',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering',
    example: '2024-01-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
