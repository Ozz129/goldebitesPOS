import { LocalNotifications, type Channel } from '@capacitor/local-notifications';
import { env, type PhoneApp } from '../../config/env';
import { nativePlatform } from './platform';

/**
 * How the phone rings for each kind of notification (Android), per app. The
 * ids are the ones the server sends with (GB-BE push-notifications.service.ts,
 * androidChannelFor). Importance 5: sound, and on top of the screen like a
 * WhatsApp message.
 */
const CHANNELS: Record<PhoneApp, Channel[]> = {
  waiter: [
    {
      id: 'tables',
      name: 'Mesas que piden ayuda',
      description: 'Cuando una mesa llama al mesero desde su menú',
      importance: 5,
      visibility: 1,
      vibration: true,
    },
    {
      id: 'deliveries',
      name: 'Pedidos listos',
      description: 'Cuando cocina termina uno de tus pedidos',
      importance: 5,
      visibility: 1,
      vibration: true,
    },
  ],
  courier: [
    {
      id: 'calls',
      name: 'Llamadas',
      description: 'Cuando el restaurante o el cliente te llama',
      importance: 5,
      visibility: 1,
      vibration: true,
    },
    {
      id: 'deliveries',
      name: 'Domicilios',
      description: 'Asignados, listos para recoger, cancelados o reasignados',
      importance: 5,
      visibility: 1,
      vibration: true,
    },
    {
      id: 'messages',
      name: 'Mensajes',
      description: 'El chat con el cliente y el restaurante',
      importance: 5,
      visibility: 1,
      vibration: true,
    },
  ],
};

/** The channel of a notification by its tag, as the server picks it (androidChannelFor). */
function channelFor(tag: string): string {
  if (tag.startsWith('call-')) return 'calls';
  if (tag.startsWith('help-')) return 'tables';
  if (tag.startsWith('chat-')) return 'messages';
  return 'deliveries';
}

/** The same tag is the same notification: a new one replaces it instead of piling up. */
function idFor(tag: string): number {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) | 0;
  return Math.abs(hash) % 2_000_000_000;
}

/** Whether this phone also gets the server's notifications (Firebase). */
let serverPushActive = false;

export function setServerPushActive(active: boolean): void {
  serverPushActive = active;
}

/** Creates the app's notification channels (Android); safe to repeat. */
export async function createNativeChannels(): Promise<void> {
  if (nativePlatform() !== 'android' || !env.phoneApp) return;
  await Promise.all(
    CHANNELS[env.phoneApp].map((channel) => LocalNotifications.createChannel(channel)),
  );
}

export type NativeNotifyPermission = 'granted' | 'denied' | 'prompt';

function toPermission(display: string): NativeNotifyPermission {
  if (display === 'granted') return 'granted';
  return display === 'denied' ? 'denied' : 'prompt';
}

export async function nativeNotifyPermission(): Promise<NativeNotifyPermission> {
  return toPermission((await LocalNotifications.checkPermissions()).display);
}

/** Shows the phone's prompt (once: after a "no", only the phone's settings can change it). */
export async function requestNativeNotifyPermission(): Promise<NativeNotifyPermission> {
  return toPermission((await LocalNotifications.requestPermissions()).display);
}

/**
 * A notification of the phone, like a WhatsApp message: on top of the
 * screen, then in the notification bar. The app shows it when it notices
 * something (a table calling, a new delivery, a message). With the server's
 * notifications on and the app out of view, the server's arrives instead
 * (the app does not repeat it); on screen Android shows none of the
 * server's, so the app's is the one.
 */
export async function showNativeNotification(
  title: string,
  body: string,
  tag: string,
  url: string = window.location.pathname,
): Promise<void> {
  if (serverPushActive && document.visibilityState !== 'visible') return;
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: idFor(tag),
          title,
          body,
          largeBody: body,
          channelId: channelFor(tag),
          smallIcon: 'ic_stat_golden_bites',
          iconColor: '#D4AF37',
          autoCancel: true,
          extra: { url },
        },
      ],
    });
  } catch {
    // Without the permission there is nothing to show; the app still rings.
  }
}

/** One of the app's notifications was tapped: `onTap` gets where it leads. */
export function onNativeNotifyTapped(onTap: (url: string) => void): () => void {
  const handle = LocalNotifications.addListener(
    'localNotificationActionPerformed',
    ({ notification }) => {
      const url = (notification.extra as { url?: unknown } | undefined)?.url;
      if (typeof url === 'string' && url.startsWith('/')) onTap(url);
    },
  );
  return () => void handle.then((h) => h.remove());
}
