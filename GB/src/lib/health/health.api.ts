import { apiClient } from '../api/api-client';

/** GET /health is decorated with @RawResponse() — no ApiResponse envelope. */
export interface HealthSummary {
  status: 'ok' | 'error';
  database: 'connected' | 'disconnected';
  uptime: number;
  timestamp: string;
}

export const healthApi = {
  async check(): Promise<HealthSummary> {
    const { data } = await apiClient.get<HealthSummary>('/health');
    return data;
  },
};
