import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  Optional,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ApiOkResponse } from '@nestjs/swagger';
import { BarberService } from '../../../../services/barber-drizzle.service';
import { CreateBarberDto } from '../dto/create-barber.dto';
import { UpdateBarberDto } from '../dto/update-barber.dto';
import { ClerkAuthGuard } from '../../../../guards/clerk-auth.guard';
import type { Barber } from '../../../../schema';
import { ListActiveBarbersUseCase } from '../../application/list-active-barbers.usecase';
import { FindBarbersByAvailabilityUseCase } from '../../application/find-barbers-by-availability.usecase';
import { FindBarberByIdUseCase } from '../../application/find-barber-by-id.usecase';
import { BarberDto } from '../dto/barber.dto';
import { toDto as barberToDto } from '../presenters/barber.presenter';

@ApiTags('barbers')
@Controller('barbers')
export class BarberController {
  constructor(
    private readonly barberService: BarberService,
    @Optional() private readonly listActiveBarbers?: ListActiveBarbersUseCase,
    @Optional()
    private readonly findBarbersByAvailability?: FindBarbersByAvailabilityUseCase,
    @Optional() private readonly findBarberById?: FindBarberByIdUseCase
  ) {}

  @Post()
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({
    summary: 'Create a new barber',
    description:
      'Creates a new barber profile with the provided information. Requires authentication.',
  })
  @ApiResponse({
    status: 201,
    description: 'Barber created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Michael Rodriguez' },
        title: { type: 'string', example: 'Master Barber' },
        bio: {
          type: 'string',
          example: 'Experienced barber with 10+ years in the industry',
        },
        image: { type: 'string', example: '/images/barber1.jpg' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
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
          example: ['name should not be empty'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async create(@Body() createBarberDto: CreateBarberDto): Promise<Barber> {
    return this.barberService.create(createBarberDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active barbers' })
  @ApiResponse({ status: 200, description: 'List of all active barbers' })
  @ApiOkResponse({ type: BarberDto, isArray: true })
  async findAll(): Promise<BarberDto[]> {
    if (this.listActiveBarbers) {
      const data = await this.listActiveBarbers.execute();
      return data.map(barberToDto);
    }
    // Legacy path: return raw service result; Nest will serialize Dates to ISO strings for HTTP
    // Cast to any to satisfy the method signature in unit tests that call it directly
    return (await this.barberService.findAll()) as unknown as BarberDto[];
  }

  @Get('available')
  @ApiOperation({ summary: 'Get barbers available on a specific date' })
  @ApiResponse({ status: 200, description: 'List of available barbers' })
  @ApiOkResponse({ type: BarberDto, isArray: true })
  async findAvailable(@Query('date') date: string): Promise<BarberDto[]> {
    const queryDate = new Date(date);
    if (this.findBarbersByAvailability) {
      const data = await this.findBarbersByAvailability.execute(queryDate);
      return data.map(barberToDto);
    }
    return (await this.barberService.findByAvailability(
      queryDate
    )) as unknown as BarberDto[];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a barber by ID' })
  @ApiParam({ name: 'id', description: 'Barber ID' })
  @ApiResponse({ status: 200, description: 'Barber details' })
  @ApiResponse({ status: 404, description: 'Barber not found' })
  @ApiOkResponse({ type: BarberDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<BarberDto> {
    if (this.findBarberById) {
      const item = await this.findBarberById.execute(id);
      return barberToDto(item);
    }
    // Legacy path: return raw service result (possibly null)
    const item = await this.barberService.findOne(id);
    // When called via HTTP, Nest serializes Dates; when called directly in unit tests, return as-is
    return item as unknown as BarberDto;
  }

  @Get(':id/details')
  @ApiOperation({
    summary: 'Get barber with related data (bookings, availability)',
  })
  @ApiParam({ name: 'id', description: 'Barber ID' })
  @ApiResponse({ status: 200, description: 'Barber with related data' })
  async findOneWithRelations(@Param('id', ParseIntPipe) id: number) {
    return await this.barberService.findWithRelations(id);
  }

  @Patch(':id')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Update a barber' })
  @ApiParam({ name: 'id', description: 'Barber ID' })
  @ApiResponse({ status: 200, description: 'Barber updated successfully' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBarberDto: UpdateBarberDto
  ) {
    return await this.barberService.update(id, updateBarberDto);
  }

  @Delete(':id')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Delete a barber' })
  @ApiParam({ name: 'id', description: 'Barber ID' })
  @ApiResponse({ status: 200, description: 'Barber deleted successfully' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.barberService.remove(id);
    return { message: 'Barber deleted successfully' };
  }
}
