let counter = 0;

/**
 * A client-only unique id for React keys/state (e.g. cart lines) — not for anything
 * security-sensitive. `crypto.randomUUID()` only exists in secure contexts (HTTPS or
 * localhost), so it throws in production when served over plain HTTP.
 */
export function generateId(): string {
  counter += 1;
  return `${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 10)}`;
}
