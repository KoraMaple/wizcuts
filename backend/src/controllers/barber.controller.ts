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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BarberService } from '../services/barber-drizzle.service';
import { CreateBarberDto, UpdateBarberDto } from '../dto/barber.dto';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import type { Barber } from '../schema';

@ApiTags('barbers')
@Controller('barbers')
export class BarberController {
  constructor(private readonly barberService: BarberService) {}

  @Post()
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Create a new barber' })
  @ApiResponse({ status: 201, description: 'Barber created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createBarberDto: CreateBarberDto): Promise<Barber> {
    return this.barberService.create(createBarberDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active barbers' })
  @ApiResponse({ status: 200, description: 'List of all active barbers' })
  async findAll() {
    return await this.barberService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Get barbers available on a specific date' })
  @ApiResponse({ status: 200, description: 'List of available barbers' })
  async findAvailable(@Query('date') date: string) {
    const queryDate = new Date(date);
    return await this.barberService.findByAvailability(queryDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a barber by ID' })
  @ApiParam({ name: 'id', description: 'Barber ID' })
  @ApiResponse({ status: 200, description: 'Barber details' })
  @ApiResponse({ status: 404, description: 'Barber not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.barberService.findOne(id);
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
