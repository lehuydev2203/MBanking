import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the health status of the application and database',
  })
  @ApiResponse({
    status: 200,
    description: 'Health status retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          status: 'up',
          db: 'ok',
          appVersion: '1.0.0',
          time: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  async getHealth() {
    return this.healthService.getHealthStatus();
  }
}
