import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus, type BookingStatusType } from '../../../../schema';

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
