import { ApiProperty } from '@nestjs/swagger';

export class BookingDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  barberId: number;

  @ApiProperty({ required: false })
  barberName?: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty({ required: false })
  customerEmail?: string;

  @ApiProperty()
  customerPhone: string;

  @ApiProperty()
  serviceName: string;

  @ApiProperty({ description: 'Total price as string' })
  totalPrice: string;

  @ApiProperty()
  appointmentDateTime: string; // ISO string

  @ApiProperty()
  durationMinutes: number;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  notes?: string | null;

  @ApiProperty({ required: false })
  clerkUserId?: string | null;

  @ApiProperty()
  createdAt: string; // ISO string

  @ApiProperty()
  updatedAt: string; // ISO string
}
