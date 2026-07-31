import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { RawResponse } from '../../../common/decorators/raw-response.decorator';
import { HealthService } from '../services/health.service';

@ApiTags('Health')
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @RawResponse()
  @ApiOperation({ summary: 'Overall service and database health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async check() {
    return this.healthService.getSummary();
  }

  @Get('ready')
  @RawResponse()
  @ApiOperation({ summary: 'Readiness probe: can the service accept traffic' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async ready() {
    const readiness = await this.healthService.getReadiness();
    if (readiness.status !== 'ready') {
      throw new ServiceUnavailableException({
        message: 'Service is not ready to accept traffic',
        checks: readiness.checks,
      });
    }
    return readiness;
  }

  @Get('live')
  @RawResponse()
  @ApiOperation({ summary: 'Liveness probe: is the process running' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  live() {
    return this.healthService.getLiveness();
  }
}
