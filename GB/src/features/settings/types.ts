import type { Channel, PaymentMethod } from '../../types/common';

/**
 * Preferencias locales de la interfaz sin modelo en el backend (ver
 * disclaimer en SettingsPage). El nombre del negocio, sedes, impuesto y
 * horarios ya se manejan con datos reales vía modules/businesses y
 * modules/branches.
 */
export interface SettingsState {
  paymentMethodsEnabled: PaymentMethod[];
  channelsEnabled: Channel[];
}
