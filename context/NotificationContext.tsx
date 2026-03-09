import { registerForPushNotificationAsync } from "@/lib/registerForPushNotificationAsync";
import * as Notifications from "expo-notifications";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Sentry from "@sentry/react-native";
import { authClient } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";

type Subscription = Notifications.EventSubscription;

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
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

  const { data: session } = authClient.useSession();

  useEffect(() => {
    registerForPushNotificationAsync().then(
      (token) => setExpoPushToken(token ?? null),
      (err) => {
        setError(err);
        Sentry.captureException(err, {
          tags: { section: "notifications", action: "register_push" },
        });
      }
    );

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("User interacted with notification:", JSON.stringify(response.notification.request.content.data, null, 2));
      }
    );

    return () => {
        notificationListener.current && notificationListener.current.remove();
      responseListener.current && responseListener.current.remove();
    };
  }, []);

  useEffect(() => {
    const saveToken = async () => {
      if (expoPushToken && session?.user?.id) {
        try {
          const { error } = await supabase
            .from("user_profiles")
            .update({ expo_push_token: expoPushToken })
            .eq("user_id", session.user.id);

          if (error) {
            console.error(`Error saving push token to Supabase for user ${session.user.id}:`, error.message, error);
            Sentry.captureMessage(`Error saving push token to Supabase: ${error.message}`, {
              level: "error",
              tags: { section: "notifications", action: "save_token_supabase" },
            });
          } else {
            console.log("Push token saved successfully for user:", session.user.id);
          }
        } catch (err) {
          console.error("Unexpected error saving push token:", err);
          Sentry.captureException(err, {
            tags: { section: "notifications", action: "save_token_catch" },
          });
        }
      }
    };

    saveToken();
  }, [expoPushToken, session?.user?.id]);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};