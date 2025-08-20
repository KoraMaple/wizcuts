import { ApiProperty } from '@nestjs/swagger';

export class BarberDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  title!: string | null;

  @ApiProperty({ required: false, nullable: true })
  bio!: string | null;

  @ApiProperty({ required: false, nullable: true })
  image!: string | null;

  @ApiProperty({ required: false, nullable: true })
  experienceYears!: number | null;

  @ApiProperty({ type: [String], required: false, nullable: true })
  specialties!: string[] | null;

  @ApiProperty({ description: 'Decimal as string' })
  rating!: string;

  @ApiProperty()
  reviewCount!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ required: false, nullable: true })
  phone!: string | null;

  @ApiProperty({ required: false, nullable: true })
  email!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
