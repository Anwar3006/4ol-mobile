/**
 * notifeeBackgroundHandler.ts
 *
 * Background notification handler.
 * Previously used @notifee/react-native — fully replaced with expo-notifications.
 *
 * expo-notifications handles background notification responses automatically
 * via the addNotificationResponseReceivedListener registered in
 * notificationActions.ts (setupNotificationHandlers). That listener fires
 * whether the app is in the foreground, background, or being re-opened from
 * a cold start.
 *
 * This file is kept as a clear documentation layer and exports a helper to
 * configure expo-notifications' global foreground presentation behaviour,
 * which must be called before any notification can be displayed.
 */

import * as Notifications from 'expo-notifications';

/**
 * Configures how expo-notifications presents notifications while the app
 * is in the FOREGROUND.
 *
 * Call this once — as early as possible in the app lifecycle (before the
 * root Slot/Stack is rendered). In Expo Router apps the ideal place is
 * the top of `app/_layout.tsx`, outside of any component.
 *
 * shouldShowAlert  — display the notification banner while app is active
 * shouldPlaySound  — play the notification sound while app is active
 * shouldSetBadge   — update the app badge count while app is active
 */
export const configureForegroundNotificationBehaviour = (): void => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};
