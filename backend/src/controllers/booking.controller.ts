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
import { BookingService } from '../services/booking.service';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { CurrentUser, AuthUser } from '../decorators/current-user.decorator';
import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingQueryDto,
} from '../dto/booking.dto';
import { ListBookingsUseCase } from '../modules/booking/application/list-bookings.usecase';
import { FindBookingByIdUseCase } from '../modules/booking/application/find-booking-by-id.usecase';
import { ListUserBookingsUseCase } from '../modules/booking/application/list-user-bookings.usecase';
import { CreateBookingUseCase } from '../modules/booking/application/create-booking.usecase';
import { UpdateBookingUseCase } from '../modules/booking/application/update-booking.usecase';
import { DeleteBookingUseCase } from '../modules/booking/application/delete-booking.usecase';
import { ConfirmBookingUseCase } from '../modules/booking/application/confirm-booking.usecase';
import { CancelBookingUseCase } from '../modules/booking/application/cancel-booking.usecase';
import { BookingDto } from '../modules/booking/interface/dto/booking.dto';
import { bookingToDto } from '../modules/booking/interface/presenters/booking.presenter';

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
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({
    status: 201,
    description: 'The booking has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'Booking conflict.' })
  @ApiOkResponse({ type: BookingDto })
  async create(
    @Body() createBookingDto: CreateBookingDto
  ): Promise<BookingDto> {
    if (this.createBooking) {
      const input: any = {
        customerName: createBookingDto.customerName,
        customerEmail: createBookingDto.customerEmail,
        serviceId: (createBookingDto as any).serviceId,
        barberId: createBookingDto.barberId,
        startTime: new Date(createBookingDto.appointmentDateTime),
        endTime: new Date(
          new Date(createBookingDto.appointmentDateTime).getTime() +
            createBookingDto.durationMinutes * 60000
        ),
        notes: createBookingDto.notes,
      };
      const booking = await this.createBooking.execute(input);
      return bookingToDto(booking);
    }
    return (await this.bookingService.create(
      createBookingDto
    )) as unknown as BookingDto;
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
    return (await this.bookingService.findAll(
      query
    )) as unknown as BookingDto[];
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
    return (await this.bookingService.findUserBookings(
      user.id
    )) as unknown as BookingDto[];
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
    return item as unknown as BookingDto;
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
