export type Channel = 'mostrador' | 'para_recoger' | 'whatsapp' | 'domicilio_propio' | 'rappi';

export const CHANNEL_LABELS: Record<Channel, string> = {
  mostrador: 'Mostrador',
  para_recoger: 'Para recoger',
  whatsapp: 'WhatsApp',
  domicilio_propio: 'Domicilio propio',
  rappi: 'Rappi',
};

export type PaymentMethod =
  | 'efectivo'
  | 'tarjeta'
  | 'nequi'
  | 'daviplata'
  | 'transferencia'
  | 'plataforma';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  transferencia: 'Transferencia',
  plataforma: 'Pago por plataforma',
};
