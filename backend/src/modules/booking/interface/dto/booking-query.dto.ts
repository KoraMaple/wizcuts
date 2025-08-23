import { IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus, type BookingStatusType } from '../../../../schema';

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
