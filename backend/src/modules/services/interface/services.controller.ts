import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ListServicesUseCase } from '../application/list-services.usecase';
import { ServiceDto } from './dto/service.dto';
import { ServicesQueryDto } from './dto/services-query.dto';
import { toDto } from './presenters/service.presenter';

@ApiTags('services')
@Controller({ path: 'services', version: '1' })
export class ServicesController {
  constructor(private readonly listServices: ListServicesUseCase) {}
  @Get()
  @ApiOperation({ summary: 'List available grooming services' })
  @ApiQuery({ name: 'category', type: String, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'active', type: Boolean, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'offset', type: Number, required: false })
  @ApiOkResponse({
    description: 'Array of services',
    type: ServiceDto,
    isArray: true,
  })
  async list(@Query() query: ServicesQueryDto): Promise<ServiceDto[]> {
    const items = await this.listServices.execute(query);
    return items.map(toDto);
  }
}
