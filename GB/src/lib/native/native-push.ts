import type { PluginListenerHandle } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { apiClient } from '../api/api-client';
import { nativePlatform } from './platform';
import { setServerPushActive } from './native-notify';

/** This phone's Firebase token, to stop the notifications on signing out. */
const TOKEN_KEY = 'gb-native-push-token';

/** Registers this phone with Firebase and waits for its token. */
function nextToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const handles: Promise<PluginListenerHandle>[] = [];
    const finish = () => handles.forEach((handle) => void handle.then((h) => h.remove()));
    handles.push(
      PushNotifications.addListener('registration', ({ value }) => {
        finish();
        resolve(value);
      }),
      PushNotifications.addListener('registrationError', ({ error }) => {
        finish();
        reject(new Error(error));
      }),
    );
    PushNotifications.register().catch((error: unknown) => {
      finish();
      reject(error instanceof Error ? error : new Error(String(error)));
    });
  });
}

/**
 * This phone receives the signed-in user's notifications from the server
 * (Firebase). Run on every opening once allowed: the token can change, and another user may have
 * signed in on this phone.
 */
export async function registerNativePush(): Promise<void> {
  const platform = nativePlatform();
  if (!platform) return;
  // The notification channels are the app's own (createNativeChannels).
  const token = await nextToken();
  await apiClient.post('/push/native-tokens', { token, platform });
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Without storage the token is only moved when another user signs in here.
  }
}

/** On signing out: this phone stops receiving that user's notifications. Best-effort. */
export async function forgetNativePush(): Promise<void> {
  setServerPushActive(false);
  let token: string | null;
  try {
    token = localStorage.getItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    return;
  }
  if (!token) return;
  await apiClient.delete('/push/native-tokens', { data: { token } }).catch(() => {});
}

/** A notification was tapped: `onTap` gets where it leads (an address of the app). */
export function onNativeNotificationTapped(onTap: (url: string) => void): () => void {
  const handle = PushNotifications.addListener(
    'pushNotificationActionPerformed',
    ({ notification }) => {
      const url = (notification.data as { url?: unknown } | undefined)?.url;
      if (typeof url === 'string' && url.startsWith('/')) onTap(url);
    },
  );
  return () => void handle.then((h) => h.remove());
}
