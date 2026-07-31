export interface HealthSummary {
  status: 'ok' | 'error';
  database: 'connected' | 'disconnected';
  uptime: number;
  timestamp: string;
}

export interface ReadinessSummary {
  status: 'ready' | 'not_ready';
  checks: {
    database: boolean;
  };
}

export interface LivenessSummary {
  status: 'alive';
}
