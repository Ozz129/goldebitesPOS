export interface ErrorResponseBody {
  statusCode: number;
  error: string;
  message: string;
  code: string;
  details: Record<string, unknown>;
  timestamp: string;
  path: string;
}
