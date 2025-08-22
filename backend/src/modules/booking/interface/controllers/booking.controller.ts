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
  Optional,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiOkResponse } from '@nestjs/swagger';
import { BookingService } from '../../../../services/booking.service';
import { ClerkAuthGuard } from '../../../../guards/clerk-auth.guard';
import {
  CurrentUser,
  AuthUser,
} from '../../../../decorators/current-user.decorator';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { BookingQueryDto } from '../dto/booking-query.dto';
import { ListBookingsUseCase } from '../../application/list-bookings.usecase';
import { FindBookingByIdUseCase } from '../../application/find-booking-by-id.usecase';
import { ListUserBookingsUseCase } from '../../application/list-user-bookings.usecase';
import { CreateBookingUseCase } from '../../application/create-booking.usecase';
import { UpdateBookingUseCase } from '../../application/update-booking.usecase';
import { DeleteBookingUseCase } from '../../application/delete-booking.usecase';
import { ConfirmBookingUseCase } from '../../application/confirm-booking.usecase';
import { CancelBookingUseCase } from '../../application/cancel-booking.usecase';
import { BookingDto } from '../dto/booking.dto';
import { bookingToDto } from '../presenters/booking.presenter';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    @Optional() private readonly listBookings?: ListBookingsUseCase,
    @Optional() private readonly findBookingById?: FindBookingByIdUseCase,
    @Optional() private readonly listUserBookings?: ListUserBookingsUseCase,
    @Optional() private readonly createBooking?: CreateBookingUseCase,
    @Optional() private readonly updateBooking?: UpdateBookingUseCase,
    @Optional() private readonly deleteBooking?: DeleteBookingUseCase,
    @Optional() private readonly confirmBooking?: ConfirmBookingUseCase,
    @Optional() private readonly cancelBooking?: CancelBookingUseCase
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new booking',
    description:
      'Creates a new booking appointment with the specified barber and service details. Requires authentication.',
  })
  @ApiResponse({
    status: 201,
    description: 'The booking has been successfully created.',
    type: BookingDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['barberId must be a positive number'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 409,
    description: 'Booking conflict - Time slot already booked',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Time slot is already booked' },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser() user: AuthUser
  ): Promise<BookingDto> {
    const created = await this.bookingService.create(createBookingDto, user);
    return bookingToDto(created as any);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiResponse({
    status: 200,
    description: 'Return all bookings.',
  })
  @ApiOkResponse({ type: BookingDto, isArray: true })
  @ApiQuery({ name: 'barberId', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async findAll(@Query() query: BookingQueryDto): Promise<BookingDto[]> {
    if (this.listBookings) {
      const data = await this.listBookings.execute(query as any);
      return data.map(bookingToDto);
    }
    const raw = await this.bookingService.findAll(query);
    return (raw as any[]).map(bookingToDto);
  }

  @Get('user/appointments')
  @ApiOperation({ summary: 'Get current user appointments' })
  @ApiResponse({
    status: 200,
    description: 'Return all appointments for the authenticated user.',
  })
  @ApiOkResponse({ type: BookingDto, isArray: true })
  async getUserAppointments(
    @CurrentUser() user: AuthUser
  ): Promise<BookingDto[]> {
    if (this.listUserBookings) {
      const data = await this.listUserBookings.execute(user.id);
      return data.map(bookingToDto);
    }
    const raw = await this.bookingService.findUserBookings(user.id);
    return (raw as any[]).map(bookingToDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by id' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Return the booking.',
  })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @ApiOkResponse({ type: BookingDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<BookingDto> {
    if (this.findBookingById) {
      const item = await this.findBookingById.execute(id);
      return bookingToDto(item);
    }
    const item = await this.bookingService.findOne(id);
    return bookingToDto(item as any);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a booking' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'The booking has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @ApiOkResponse({ type: BookingDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingDto: UpdateBookingDto
  ): Promise<BookingDto> {
    if (this.updateBooking) {
      const input: any = {
        startTime: updateBookingDto.appointmentDateTime
          ? new Date(updateBookingDto.appointmentDateTime)
          : undefined,
        notes: updateBookingDto.notes,
      };
      const booking = await this.updateBooking.execute(id, input);
      return bookingToDto(booking);
    }
    return (await this.bookingService.update(
      id,
      updateBookingDto
    )) as unknown as BookingDto;
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
    if (this.deleteBooking) {
      await this.deleteBooking.execute(id);
    } else {
      await this.bookingService.remove(id);
    }
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
  @ApiOkResponse({ type: BookingDto })
  async confirm(@Param('id', ParseIntPipe) id: number): Promise<BookingDto> {
    if (this.confirmBooking) {
      const booking = await this.confirmBooking.execute(id);
      return bookingToDto(booking);
    }
    return (await this.bookingService.confirm(id)) as unknown as BookingDto;
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'The booking has been cancelled.',
  })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @ApiOkResponse({ type: BookingDto })
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser
  ): Promise<BookingDto> {
    if (this.cancelBooking) {
      const booking = await this.cancelBooking.execute(id, user.id);
      return bookingToDto(booking);
    }
    return (await this.bookingService.cancel(
      id,
      user.id
    )) as unknown as BookingDto;
  }
}
