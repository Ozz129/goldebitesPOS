import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SettingsState } from '../features/settings/types';
import type { Channel, PaymentMethod } from '../types/common';

interface SettingsStore extends SettingsState {
  togglePaymentMethod: (method: PaymentMethod) => void;
  toggleChannel: (channel: Channel) => void;
}

const defaultState: SettingsState = {
  paymentMethodsEnabled: ['efectivo', 'tarjeta', 'nequi', 'daviplata', 'transferencia', 'plataforma'],
  channelsEnabled: ['mostrador', 'para_recoger', 'whatsapp', 'domicilio_propio', 'rappi'],
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultState,
      togglePaymentMethod: (method) =>
        set((s) => ({
          paymentMethodsEnabled: s.paymentMethodsEnabled.includes(method)
            ? s.paymentMethodsEnabled.filter((m) => m !== method)
            : [...s.paymentMethodsEnabled, method],
        })),
      toggleChannel: (channel) =>
        set((s) => ({
          channelsEnabled: s.channelsEnabled.includes(channel)
            ? s.channelsEnabled.filter((c) => c !== channel)
            : [...s.channelsEnabled, channel],
        })),
    }),
    { name: 'gb-settings' },
  ),
);
