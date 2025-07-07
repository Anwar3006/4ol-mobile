import notifee, {EventType} from '@notifee/react-native';
import {handleNotificationAction} from './notificationActions';

export async function onBackgroundEvent(event: any) {
  try {
    if (event.type === EventType.ACTION_PRESS) {
      await handleNotificationAction(event.detail);
    }
  } catch (error: any) {
    console.error('Background notification handler failed:', error.message);
  } finally {
    return Promise.resolve();
  }
}

notifee.onBackgroundEvent(onBackgroundEvent);
