import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsDateString,
  Min,
  IsEmail,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @Matches(/^\+?[1-9]\d{7,14}$/, {
    message: 'customerPhone must be a valid E.164 phone number',
  })
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
  @Matches(/^\d+(?:\.\d{1,2})?$/, {
    message: 'totalPrice must be a valid amount with up to 2 decimal places',
  })
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
