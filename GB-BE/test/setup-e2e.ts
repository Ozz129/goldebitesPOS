// Forces e2e tests onto the isolated test database regardless of what
// DB_NAME is set to in the developer's .env. Must run before any module
// that loads dotenv (dotenv never overrides an already-set env var), so
// this is wired in as a Jest `setupFiles` entry (runs first, before the
// test framework itself).
process.env.DB_NAME = process.env.DB_NAME_TEST ?? 'golden_bites_test';
