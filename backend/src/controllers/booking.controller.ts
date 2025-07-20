import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BookingService } from '../services/booking.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingQueryDto,
} from '../dto/booking.dto';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({
    status: 201,
    description: 'The booking has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'Booking conflict.' })
  async create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiResponse({
    status: 200,
    description: 'Return all bookings.',
  })
  @ApiQuery({ name: 'barberId', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async findAll(@Query() query: BookingQueryDto) {
    return this.bookingService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by id' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Return the booking.',
  })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a booking' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'The booking has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a booking' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'The booking has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.bookingService.remove(id);
    return { message: 'Booking deleted successfully' };
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm a pending booking' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'The booking has been confirmed.',
  })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  async confirm(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.confirm(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'The booking has been cancelled.',
  })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  async cancel(@Param('id', ParseIntPipe) id: number) {
    // Note: In real implementation, we'd get user from auth context
    // For now, we'll need to modify the service or handle this differently
    return this.bookingService.cancel(id, 'user-id-placeholder');
  }
}
