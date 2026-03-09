import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Camera from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Linking from 'expo-linking';

const buildSettingsAlert = (title: string, message: string) => {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Open Settings', onPress: () => Linking.openSettings() },
  ]);
};

export const ensureCameraPermission = async () => {
  const [status, requestPermission] = await Camera.useCameraPermissions();
  
  if (status?.granted) return true;

  const result = await requestPermission();
  if (result?.granted) return true;

  buildSettingsAlert('Camera Permission Needed', 'Please enable camera access in settings.');
  return false;
};

export const ensurePhotoLibraryPermission = async () => {
  const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();

  if (status === 'granted') return true;

  if (canAskAgain) {
    const { status: nextStatus } = await MediaLibrary.requestPermissionsAsync();
    return nextStatus === 'granted';
  }

  buildSettingsAlert('Library Permission Needed', 'Please enable photo library access in settings.');
  return false;
};

export const ensureNotificationPermission = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    buildSettingsAlert('Notifications Disabled', 'Enable notifications in Settings for reminders.');
    return false;
  }
  return true;
};