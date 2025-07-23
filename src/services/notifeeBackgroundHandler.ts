import notifee, {EventType} from '@notifee/react-native';
import {
  handleNotificationAction,
  handleNotificationPress,
} from './notificationActions';

export async function onBackgroundEvent(event: any) {
  try {
    if (event.type === EventType.ACTION_PRESS) {
      await handleNotificationAction(event.detail);
    } else if (event.type === EventType.PRESS) {
      await handleNotificationPress(event.detail.notification);
    }
  } catch (error: any) {
    console.error('Background notification handler failed:', error.message);
  } finally {
    return Promise.resolve();
  }
}

notifee.onBackgroundEvent(onBackgroundEvent);
