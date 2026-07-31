let counter = 0;

/** Genera un id único y estable para uso en mocks y creación local de registros. */
export function generateId(prefix = 'id'): string {
  counter += 1;
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${random}${counter}`;
}

/** Genera un consecutivo legible tipo folio, ej. GB-000123. */
export function generateFolio(prefix: string, sequence: number): string {
  return `${prefix}-${String(sequence).padStart(6, '0')}`;
}
