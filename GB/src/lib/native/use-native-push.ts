import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/api-client';
import type { ApiResponse } from '../api/api-types';
import { onNativeNotificationTapped, registerNativePush } from './native-push';
import {
  createNativeChannels,
  nativeNotifyPermission,
  onNativeNotifyTapped,
  requestNativeNotifyPermission,
  setServerPushActive,
} from './native-notify';

/**
 * - loading: still finding out.
 * - server-off: not used by the installed apps (they notify on their own).
 * - off: can be turned on (asks for permission, from a tap).
 * - denied: the person said no; only the phone's settings can undo it.
 * - on: this phone shows the notifications.
 */
export type NativePushState = 'loading' | 'server-off' | 'off' | 'denied' | 'on';

/** Whether the server sends to the phone apps (it has Firebase). */
async function serverSendsPush(): Promise<boolean> {
  try {
    const { data } =
      await apiClient.get<ApiResponse<{ nativeEnabled?: boolean }>>('/push/public-key');
    return Boolean(data.data.nativeEnabled);
  } catch {
    return false;
  }
}

/**
 * With the permission: the app's notification channels, and the server's
 * notifications too when it sends them (this phone's token, saved again on
 * every opening: it may change, or another user may have signed in here).
 */
async function turnOn(): Promise<void> {
  await createNativeChannels();
  if (await serverSendsPush()) {
    await registerNativePush();
    setServerPushActive(true);
  }
}

/**
 * The installed phone app's notifications, like WhatsApp's: the app shows
 * its own when it notices something (native-notify.ts) and, when the server
 * has Firebase, the server's arrive with the app closed. Asks for the
 * permission from a tap; a tapped notification opens where it leads.
 */
export function useNativePush(): { state: NativePushState; enable: () => Promise<void> } {
  const [state, setState] = useState<NativePushState>('loading');
  const navigate = useNavigate();

  useEffect(() => onNativeNotificationTapped((url) => navigate(url)), [navigate]);
  useEffect(() => onNativeNotifyTapped((url) => navigate(url)), [navigate]);

  useEffect(() => {
    let cancelled = false;
    const done = (next: NativePushState) => {
      if (!cancelled) setState(next);
    };
    (async () => {
      const permission = await nativeNotifyPermission();
      if (permission === 'granted') {
        await turnOn();
        done('on');
        return;
      }
      done(permission === 'denied' ? 'denied' : 'off');
    })().catch(() => done('off'));
    return () => {
      cancelled = true;
    };
  }, []);

  const enable = useCallback(async () => {
    const permission = await requestNativeNotifyPermission();
    if (permission !== 'granted') {
      setState(permission === 'denied' ? 'denied' : 'off');
      return;
    }
    await turnOn();
    setState('on');
  }, []);

  return { state, enable };
}
