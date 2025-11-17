import {Alert, Platform} from 'react-native';
import {
  PERMISSIONS,
  check,
  openSettings,
  request,
  RESULTS,
} from 'react-native-permissions';
import notifee, {
  AuthorizationStatus,
} from '@notifee/react-native';

type PermissionPromptOptions = {
  title: string;
  message: string;
};

const buildSettingsAlert = (
  title: string,
  message: string,
  onCancel?: () => void,
) => {
  Alert.alert(title, message, [
    {
      text: 'Cancel',
      style: 'cancel',
      onPress: onCancel,
    },
    {
      text: 'Open Settings',
      onPress: () => {
        openSettings().catch(() => {});
      },
    },
  ]);
};

const ensurePermission = async (
  permission: string,
  {title, message}: PermissionPromptOptions,
) => {
  try {
    let status = await check(permission);

    if (status === RESULTS.DENIED) {
      status = await request(permission);
    }

    if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
      return true;
    }

    if (status === RESULTS.BLOCKED) {
      buildSettingsAlert(title, message);
    }

    return false;
  } catch (error) {
    console.warn(`Permission request failed for ${permission}`, error);
    return false;
  }
};

export const ensureCameraPermission = async () => {
  const permission =
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;

  return ensurePermission(permission, {
    title: 'Camera Permission Needed',
    message:
      'Please enable camera access in your settings to take medication photos.',
  });
};

export const ensurePhotoLibraryPermission = async () => {
  const permission =
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.PHOTO_LIBRARY
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

  const hasLibraryAccess = await ensurePermission(permission, {
    title: 'Photo Library Permission Needed',
    message:
      'Please enable photo library access in your settings to choose or save medication images.',
  });

  if (!hasLibraryAccess || Platform.OS !== 'ios') {
    return hasLibraryAccess;
  }

  // Request add-only access as well to allow saving images back to the library.
  return ensurePermission(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY, {
    title: 'Photo Library Permission Needed',
    message:
      'Please enable photo library access in your settings to store medication images.',
  });
};

const pendingNotificationRequest: {requested: boolean; granted: boolean} = {
  requested: false,
  granted: false,
};

export const ensureNotificationPermission = async () => {
  // Avoid hammering the permission prompt if multiple code paths call this simultaneously.
  if (pendingNotificationRequest.requested && !pendingNotificationRequest.granted) {
    return false;
  }

  try {
    const settings = await notifee.getNotificationSettings();

    if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
      pendingNotificationRequest.requested = true;
      pendingNotificationRequest.granted = true;
      return true;
    }

    const status = await notifee.requestPermission();
    const granted =
      status.authorizationStatus >= AuthorizationStatus.AUTHORIZED;

    pendingNotificationRequest.requested = true;
    pendingNotificationRequest.granted = granted;

    if (!granted) {
      buildSettingsAlert(
        'Notifications Disabled',
        'Enable notifications in Settings so we can schedule your medication reminders.',
      );
    }

    return granted;
  } catch (error) {
    console.warn('Unable to request notification permission', error);
    return false;
  }
};

