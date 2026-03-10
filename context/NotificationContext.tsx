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
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<Subscription | null>(null);
  const responseListener = useRef<Subscription | null>(null);

  const { data: session } = authClient.useSession();

  useEffect(() => {
    // registerForPushNotificationAsync never throws/rejects — it returns null
    // on emulators and unsupported devices. Use async/await so we have a clean
    // try/catch with no implicit unhandled-rejection risk.
    let cancelled = false;

    const init = async () => {
      try {
        const token = await registerForPushNotificationAsync();
        if (!cancelled) {
          setExpoPushToken(token ?? null);
        }
      } catch (err: any) {
        // This should never be reached (registerForPushNotificationAsync catches
        // internally) but acts as a last-resort safety net so the context never
        // crashes the app tree.
        if (!cancelled) {
          const msg: string = err?.message ?? "";
          const isEmulatorError =
            msg.includes("physical device") ||
            msg.includes("emulator") ||
            msg.includes("simulator");

          setError(err);

          // Only capture in Sentry for unexpected, non-emulator errors
          if (!isEmulatorError) {
            Sentry.captureException(err, {
              tags: { section: "notifications", action: "register_push" },
            });
          }
        }
      }
    };

    init();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((n) => {
        setNotification(n);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "[Notifications] User tapped notification:",
          JSON.stringify(
            response.notification.request.content.data,
            null,
            2,
          ),
        );
      });

    return () => {
      cancelled = true;
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // Save token to Supabase whenever we have both token and a signed-in user
  useEffect(() => {
    if (!expoPushToken || !session?.user?.id) return;

    const saveToken = async () => {
      try {
        const { error: dbError } = await supabase
          .from("user_profiles")
          .update({ expo_push_token: expoPushToken })
          .eq("user_id", session.user.id);

        if (dbError) {
          console.error("[Notifications] Failed to save token:", dbError.message);
          Sentry.captureMessage(
            `Error saving push token: ${dbError.message}`,
            {
              level: "error",
              tags: { section: "notifications", action: "save_token_supabase" },
            },
          );
        } else {
          console.log(
            "[Notifications] Token saved for user:",
            session.user.id,
          );
        }
      } catch (err) {
        console.error("[Notifications] Unexpected error saving token:", err);
        Sentry.captureException(err, {
          tags: { section: "notifications", action: "save_token_catch" },
        });
      }
    };

    saveToken();
  }, [expoPushToken, session?.user?.id]);

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification, error }}>
      {children}
    </NotificationContext.Provider>
  );
};
