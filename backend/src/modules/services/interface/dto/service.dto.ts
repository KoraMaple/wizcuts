import { ApiProperty } from '@nestjs/swagger';

export class ServiceDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Classic Cut' })
  name!: string;

  @ApiProperty({ example: 'Precision haircut tailored to you' })
  description!: string;

  @ApiProperty({
    example: '30.00',
    description: 'Base price as string decimal',
  })
  basePrice!: string;

  @ApiProperty({ example: 30 })
  durationMinutes!: number;

  @ApiProperty({ example: 'haircut' })
  category!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({
    example: 'https://example.com/images/classic-cut.jpg',
    required: false,
  })
  image?: string | null;

  @ApiProperty({ example: '2025-08-20T20:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2025-08-20T20:00:00.000Z' })
  updatedAt!: string;
}
