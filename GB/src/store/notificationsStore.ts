import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/id';

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  level: NotificationLevel;
  createdAt: string;
  read: boolean;
  link?: string;
}

interface NotificationsState {
  notifications: AppNotification[];
  addNotification: (input: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

/**
 * No hay backend de notificaciones todavía — esta store empieza vacía y solo
 * se llena si algún componente real llama a addNotification (hoy lo hace
 * WaiterKioskPage cuando un pedido propio pasa a READY). No inventar alertas
 * de ejemplo aquí.
 */
export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (input) =>
        set((s) => ({
          notifications: [
            {
              ...input,
              id: generateId('ntf'),
              createdAt: new Date().toISOString(),
              read: false,
            },
            ...s.notifications,
          ].slice(0, 50),
        })),
      markAsRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllAsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'gb-notifications',
      // v1: se quitaron las notificaciones de ejemplo hardcodeadas. Subir la
      // versión hace que zustand descarte cualquier estado ya persistido en
      // el localStorage del navegador (que aún podía tener las 4 alertas
      // falsas de antes) y arranque limpio, sin que cada usuario tenga que
      // borrar su localStorage a mano.
      version: 1,
    },
  ),
);
