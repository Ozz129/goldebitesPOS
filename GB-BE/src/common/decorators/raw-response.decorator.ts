import { SetMetadata } from '@nestjs/common';

export const RESPONSE_RAW_KEY = 'response_raw';

/**
 * Marks a handler's return value to bypass the standard response envelope
 * (e.g. file streams, redirects).
 */
export const RawResponse = () => SetMetadata(RESPONSE_RAW_KEY, true);
