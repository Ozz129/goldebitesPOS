import type { StatusTone } from '../../components/common/StatusChip';
import type { OrderStatus, OrderType, OrderPaymentStatus } from './types/order.types';
import type { PaymentMethod } from './types/payment.types';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  NEQUI: 'Nequi',
  DAVIPLATA: 'Daviplata',
  OTHER: 'Otro',
};

/** Mirrors GB-BE's ALLOWED_TRANSITIONS in orders.service.ts — keep in sync. */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

/** Kanban/pipeline column order (CANCELLED is terminal and shown separately). */
export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'DELIVERED',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'En preparación',
  READY: 'Listo',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export const ORDER_STATUS_TONE: Record<OrderStatus, StatusTone> = {
  PENDING: 'info',
  CONFIRMED: 'gold',
  PREPARING: 'warning',
  READY: 'success',
  DELIVERED: 'neutral',
  CANCELLED: 'error',
};

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  DINE_IN: 'En mesa',
  TAKEAWAY: 'Para recoger',
  DELIVERY: 'Domicilio',
  CAR_SERVICE: 'Servicio en carro',
};

export const PAYMENT_STATUS_LABELS: Record<OrderPaymentStatus, string> = {
  PENDING: 'Sin pagar',
  PAID: 'Pagado',
  PARTIALLY_PAID: 'Pago parcial',
  REFUNDED: 'Reembolsado',
  CANCELLED: 'Cancelado',
};

export const PAYMENT_STATUS_TONE: Record<OrderPaymentStatus, StatusTone> = {
  PENDING: 'warning',
  PAID: 'success',
  PARTIALLY_PAID: 'info',
  REFUNDED: 'neutral',
  CANCELLED: 'error',
};

export function nextStatusFor(status: OrderStatus): OrderStatus | null {
  return ALLOWED_TRANSITIONS[status][0] ?? null;
}

const ORDER_SLA_MINUTES = 15;

export function getElapsedMinutes(createdAt: string): number {
  return (Date.now() - new Date(createdAt).getTime()) / 60000;
}

export const ACTIVE_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'];

export function isOrderDelayed(status: OrderStatus, createdAt: string): boolean {
  if (!ACTIVE_STATUSES.includes(status)) return false;
  return getElapsedMinutes(createdAt) > ORDER_SLA_MINUTES;
}
