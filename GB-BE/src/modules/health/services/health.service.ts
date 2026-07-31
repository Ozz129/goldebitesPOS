import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import {
  HealthSummary,
  LivenessSummary,
  ReadinessSummary,
} from '../domain/health.types';

@Injectable()
export class HealthService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getSummary(): Promise<HealthSummary> {
    const dbHealth = await this.databaseService.healthCheck();
    return {
      status: dbHealth.connected ? 'ok' : 'error',
      database: dbHealth.connected ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness(): Promise<ReadinessSummary> {
    const dbHealth = await this.databaseService.healthCheck();
    return {
      status: dbHealth.connected ? 'ready' : 'not_ready',
      checks: {
        database: dbHealth.connected,
      },
    };
  }

  getLiveness(): LivenessSummary {
    return { status: 'alive' };
  }
}
