import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as Notifications from 'expo-notifications';
import * as Sentry from '@sentry/react-native';
import { useSelector } from 'react-redux';
import { registerForPushNotificationAsync } from '../lib/registerForPushNotificationAsync';
import { supabase } from '../../lib/supabase';
import { user as userSelector } from '../store/selectors';

type Subscription = Notifications.EventSubscription;

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<Subscription | null>(null);
  const responseListener = useRef<Subscription | null>(null);

  // Pull the logged-in user from Redux so we can save the token to Supabase
  const userData: any = useSelector(userSelector);

  // ─── Register for push token once on mount ────────────────────────────────
  useEffect(() => {
    registerForPushNotificationAsync().then(
      (token) => setExpoPushToken(token),
      (err: Error) => {
        setError(err);
        Sentry.captureException(err, {
          tags: { section: 'notifications', action: 'register_push' },
        });
      },
    );

    // Fires when a notification is received while the app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((incoming) => {
        setNotification(incoming);
      });

    // Fires when the user taps on a notification (foreground OR background)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          '[Notifications] User interacted:',
          JSON.stringify(response.notification.request.content.data, null, 2),
        );
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // ─── Persist push token to Supabase whenever it or the user changes ───────
  useEffect(() => {
    const saveToken = async () => {
      const userId = userData?.id;
      if (!expoPushToken || !userId) return;

      try {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ expo_push_token: expoPushToken })
          .eq('id', userId);

        if (updateError) {
          console.error('[Notifications] Failed to save push token:', updateError.message);
          Sentry.captureMessage(
            `Error saving expo push token to Supabase: ${updateError.message}`,
            {
              level: 'error',
              tags: { section: 'notifications', action: 'save_token_supabase' },
            },
          );
        } else {
          console.log('[Notifications] Push token saved for user:', userId);
        }
      } catch (err) {
        console.error('[Notifications] Unexpected error saving push token:', err);
        Sentry.captureException(err, {
          tags: { section: 'notifications', action: 'save_token_catch' },
        });
      }
    };

    saveToken();
  }, [expoPushToken, userData?.id]);

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification, error }}>
      {children}
    </NotificationContext.Provider>
  );
};
