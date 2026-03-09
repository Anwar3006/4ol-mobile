import { Platform } from "react-native";
import * as Notification from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

export async function registerForPushNotificationAsync() {
  //if platform is android, create a notification channel
  if (Platform.OS === "android") {
    await Notification.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notification.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // if device is a physical device
  if (Device.isDevice) {
    // get notification permissions
    const { status: existingStatus } = await Notification.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notification.requestPermissionsAsync();
      finalStatus = status;
    }

    //if permissions are not granted
    if (finalStatus !== "granted") {
      throw new Error("Failed to get push token for push notification!");
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      console.error("EAS Project ID not found in app.json/app.config.js");
      throw new Error("Project ID not found");
    }

    try {
      const pushTokenString = (
        await Notification.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log("Expo Push Token:", pushTokenString);

      return pushTokenString;
    } catch (error: unknown) {
      console.error("Error fetching Expo Push Token:", error);
      throw new Error(`${error}`);
    }
  } else {
    throw new Error("Must use physical device for Push Notifications");
  }
}
