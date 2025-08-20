import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class ServicesQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by category',
    example: 'haircut',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Search in name/description',
    example: 'fade',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active state', example: true })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === 'true' || value === true
  )
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    description: 'Max items to return',
    example: 20,
    default: 20,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 20 : parseInt(value, 10)))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Offset for pagination',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 0 : parseInt(value, 10)))
  @IsInt()
  @Min(0)
  offset: number = 0;
}
