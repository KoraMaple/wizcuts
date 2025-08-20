import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Basic service health check' })
  @ApiOkResponse({
    description: 'Service is healthy',
    schema: { example: { status: 'ok' } },
  })
  get() {
    return { status: 'ok' };
  }
}
