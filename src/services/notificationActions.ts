import notifee, {EventType} from '@notifee/react-native';
import {
  markasComplete,
  markasSkip,
  markasSnooze,
} from './notificationButtonPress';

export const handleNotificationAction = async ({
  notification,
  pressAction,
}: {
  notification: any;
  pressAction: any;
}) => {
  try {
    if (!notification || !pressAction) {
      throw new Error('Invalid notification action data');
    }

    const medicationId = notification?.data?.medicationId;

    if (!medicationId) {
      throw new Error('Missing medicationId in notification data');
    }

    switch (pressAction.id) {
      case 'complete':
        await markasComplete(medicationId);
        break;
      case 'skip':
        await markasSkip(medicationId);
        break;
      case 'snooze':
        await markasSnooze(medicationId);
        break;
      default:
        console.warn('Unknown action type:', pressAction.id);
    }
  } catch (error: any) {
    console.error('Notification action failed:', {
      error: error.message,
      notificationId: notification?.id,
      action: pressAction?.id,
      timestamp: new Date().toISOString(),
    });
  } finally {
    try {
      if (notification?.id) {
        await notifee.cancelNotification(notification.id);
      }
    } catch (cancelError: any) {
      console.error('Failed to cancel notification:', cancelError.message);
    }
  }
};

export const setupNotificationHandlers = () => {
  // Foreground event handler
  notifee.onForegroundEvent(async (event: any) => {
    try {
      if (event.type === EventType.ACTION_PRESS) {
        await handleNotificationAction(event.detail);
      }
    } catch (error: any) {
      console.error('Foreground notification handler failed:', error.message);
    }
  });

  // Background event handler
  // notifee.onBackgroundEvent(async (event: any) => {
  //   try {
  //     if (event.type === EventType.ACTION_PRESS) {
  //       await handleNotificationAction(event.detail);
  //     }
  //   } catch (error: any) {
  //     console.error('Background notification handler failed:', error.message);

  //     // For background events, we might want to log this more persistently
  //     // since the app might terminate immediately after
  //     // Consider writing to AsyncStorage or sending to your error tracking service
  //   } finally {
  //     return Promise.resolve(); // Important for iOS background execution
  //   }
  // });
};

//This function is for ios
export const setupNotificationCategories = async () => {
  await notifee.setNotificationCategories([
    {
      id: 'user_actions',
      actions: [
        {
          id: 'complete',
          title: 'Complete',
        },
        {
          id: 'skip',
          title: 'Skip',
        },
        {
          id: 'snooze',
          title: 'Snooze (5m)',
        },
      ],
    },
  ]);
};
