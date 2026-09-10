function requireEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${key}". Check your .env.development file (see .env.example).`,
    );
  }
  return value;
}

export const env = {
  apiBaseUrl: requireEnv('VITE_API_BASE_URL'),
  // Global kill switch mirroring the backend's WOMPI_PAYMENTS_ENABLED — keeps the sandbox
  // checkout button out of the UI entirely until it's explicitly turned on.
  wompiPaymentsEnabled: import.meta.env.VITE_WOMPI_PAYMENTS_ENABLED === 'true',
};
