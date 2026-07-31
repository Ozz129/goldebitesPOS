export type WasteReason =
  | 'vencimiento'
  | 'mala_preparacion'
  | 'derrame'
  | 'producto_quemado'
  | 'dano_empaque'
  | 'error_pedido'
  | 'diferencia_inventario'
  | 'otro';

export const WASTE_REASON_LABELS: Record<WasteReason, string> = {
  vencimiento: 'Vencimiento',
  mala_preparacion: 'Mala preparación',
  derrame: 'Derrame',
  producto_quemado: 'Producto quemado',
  dano_empaque: 'Daño de empaque',
  error_pedido: 'Error de pedido',
  diferencia_inventario: 'Diferencia de inventario',
  otro: 'Otro',
};
