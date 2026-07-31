/** SLA de preparación en minutos antes de considerar un pedido retrasado. */
export const ORDER_SLA_MINUTES = 15;

export function getElapsedMinutes(createdAt: string): number {
  return (Date.now() - new Date(createdAt).getTime()) / 60000;
}
