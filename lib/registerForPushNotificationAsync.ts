import { Platform } from "react-native";
import * as Notification from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

export async function registerForPushNotificationAsync(): Promise<string | null> {
  // The ENTIRE body is wrapped in try/catch so no rejection can ever escape
  // to callers. getPermissionsAsync / requestPermissionsAsync can both throw on
  // Google Play Store AVDs where Device.isDevice === true.
  try {
    // Create notification channel on Android first — safe on all devices
    if (Platform.OS === "android") {
      await Notification.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notification.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    // Push tokens only work on physical devices
    if (!Device.isDevice) {
      console.log("[Notifications] Skipping — emulator/simulator (Device.isDevice is false).");
      return null;
    }

    // Request permission
    const { status: existingStatus } = await Notification.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notification.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("[Notifications] Push notification permission denied.");
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      console.error("[Notifications] EAS Project ID not found in app.json.");
      return null;
    }

    const pushTokenString = (
      await Notification.getExpoPushTokenAsync({ projectId })
    ).data;

    console.log("[Notifications] Expo Push Token:", pushTokenString);
    return pushTokenString;
  } catch (error: unknown) {
    // Log locally but never throw — expected failures include:
    //  • "Must use physical device for Push Notifications" (Google Play AVD)
    //  • Permission denied races
    //  • Missing projectId
    const msg = error instanceof Error ? error.message : String(error);
    const isExpectedEmulatorError =
      msg.includes("physical device") ||
      msg.includes("emulator") ||
      msg.includes("simulator");

    if (!isExpectedEmulatorError) {
      console.error("[Notifications] Unexpected push token error:", msg);
    } else {
      console.log("[Notifications] Skipping — push tokens not supported on this device:", msg);
    }

    return null;
  }
}
