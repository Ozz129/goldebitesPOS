export const bankTransferKeys = {
  status: (orderId: string) => ['bank-transfer', orderId, 'status'] as const,
};
