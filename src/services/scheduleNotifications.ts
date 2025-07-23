import notifee, {
  TriggerType,
  TimestampTrigger,
  AndroidImportance,
  AndroidStyle,
} from '@notifee/react-native';
import moment from 'moment';
import {themeColors} from '../../src/theme/colors';
import {SCREENS} from '../constants/screens';

export const clearAllNotifications = async () => {
  try {
    const scheduledNotifications = await notifee.getTriggerNotifications();
    console.log(
      `Clearing ${scheduledNotifications.length} existing notifications`,
    );

    const cancelPromises = scheduledNotifications.map(notification =>
      notifee.cancelNotification(notification.notification.id),
    );

    await Promise.all(cancelPromises);

    const channels = await notifee.getChannels();

    const channelPromises = channels.map(channel =>
      notifee.deleteChannel(channel.id),
    );

    await Promise.all(channelPromises);

    console.log('Successfully cleared all notifications and channels');
    return true;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return false;
  }
};

export const createMedicationChannel = async (
  medicationId: string,
  medicationName: string,
  color: string,
) => {
  try {
    const channelId = `medication_${medicationId}`;

    await notifee.createChannel({
      id: channelId,
      name: `${medicationName} Reminders`,
      lights: true,
      sound: 'default',
      vibration: true,
      importance: AndroidImportance.HIGH,
      lightColor: color || themeColors.primary,
    });

    return channelId;
  } catch (error) {
    console.error('Error creating notification channel:', error);
    return 'default';
  }
};

const parseTimestamp = (timestampStr: string): Date => {
  const date = moment(timestampStr).toDate();
  return date;
};

export const scheduleNotification = async (
  medicationId: string,
  medicationName: string,
  medicationType: string,
  timestamp: string,
  amount: number,
  dose: number,
  channelId: string,
  color: string,
  imageUrl?: string,
) => {
  try {
    const date = parseTimestamp(timestamp);
    const now = new Date();

    if (date < now) {
      console.log(
        `Skipping past timestamp for ${medicationName}: ${timestamp}`,
      );
      return null;
    }

    let medicineInfo = '';
    if (dose) {
      medicineInfo += `${dose} (dosage) `;
    }

    if (amount) {
      const typeLabel = getTypeLabel(medicationType, amount);
      medicineInfo += `${amount} ${typeLabel}`;
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };
    const data = {
      type: 'medication-reminder',
      medicationId,
      screen: 'Details',
    };

    try {
      // Create the notification with simple launch configuration
      const notificationId = await notifee.createTriggerNotification(
        {
          id: `${medicationId}_${date.getTime()}`,
          title: `Time to take ${medicationName}`,
          body: medicineInfo
            ? `Take ${medicineInfo}`
            : 'Time for your medication',
          data,
          android: {
            sound: 'default',
            smallIcon: 'ic_notification',
            actions: [
              {
                title: 'Complete',
                pressAction: {id: 'complete'},
              },
              {
                title: 'Skip',
                pressAction: {id: 'skip'},
              },
              {
                title: 'Snooze (15m)',
                pressAction: {id: 'snooze'},
              },
            ],
            channelId,
            color: color || '#9c27b0',
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
              launchActivity: 'default', // Launch the main activity when pressed
            },
            fullScreenAction: {
              id: 'default',
              launchActivity: 'default',
            },
            ...(imageUrl && {largeIcon: imageUrl}),
            style: imageUrl
              ? {
                  type: AndroidStyle.BIGPICTURE,
                  picture: imageUrl,
                  largeIcon: null,
                }
              : undefined,
          },
          ios: {
            sound: 'default',
            categoryId: 'user_actions',
            attachments: imageUrl
              ? [
                  {
                    url: imageUrl,
                    thumbnailHidden: false,
                  },
                ]
              : [],
            foregroundPresentationOptions: {
              badge: true,
              sound: true,
              banner: true,
            },
          },
        },
        trigger,
      );

      // console.log(
      //   `Scheduled notification for ${medicationName} at ${date.toLocaleString()}`,
      // );
      console.log('I AM RUNNING===>>from trigger notification');
      return notificationId;
    } catch (error) {
      console.log('Trigger notification Error;', error);
      console.log('Trigger notification not runed;');
    }
  } catch (error: any) {
    console.error('Error scheduling notification:', error);
    console.error('Error scheduling notification:', error.message, error.stack);
    return null;
  }
};

const getTypeLabel = (type: string, count: number): string => {
  if (!type) return 'unit(s)';

  const isSingular = count === 1;

  switch (type.toUpperCase()) {
    case 'TABLET':
      return isSingular ? 'tablet' : 'tablets';
    case 'CAPSULE':
      return isSingular ? 'capsule' : 'capsules';
    case 'INJECTION':
      return isSingular ? 'injection' : 'injections';
    case 'SPRAY':
      return isSingular ? 'spray' : 'sprays';
    case 'DROPS':
      return 'drops';
    case 'SOLUTION':
      return 'ml';
    case 'HERBS':
      return isSingular ? 'sachet' : 'sachets';
    default:
      return 'unit(s)';
  }
};

export const scheduleMedicationReminders = async medication => {
  if (!medication || !medication.id || !medication.medication_name) {
    console.error('Invalid medication data');
    return [];
  }

  try {
    const {
      id,
      medication_name,
      medication_type,
      medication_amount,
      medication_dose,
      reminder_timestamps,
      color,
      imageUrl, // Add imageUrl
    } = medication;

    if (
      !reminder_timestamps ||
      !Array.isArray(reminder_timestamps) ||
      reminder_timestamps.length === 0
    ) {
      console.log(`No timestamps for ${medication_name}, skipping`);
      return [];
    }

    const channelId = await createMedicationChannel(id, medication_name, color);

    const notificationPromises = reminder_timestamps.map(timestamp =>
      scheduleNotification(
        id,
        medication_name,
        medication_type,
        timestamp,
        medication_amount,
        medication_dose,
        channelId,
        color,
        imageUrl, // Pass imageUrl to the function
      ),
    );

    const notificationIds = await Promise.all(notificationPromises);
    const validIds = notificationIds.filter(id => id !== null);

    // console.log(
    //   `Scheduled ${validIds.length} notifications for ${medication_name}`,
    // );
    return validIds;
  } catch (error) {
    console.error(
      `Error scheduling reminders for ${medication.medication_name}:`,
      error,
    );
    return [];
  }
};

export const refreshAllNotifications = async medications => {
  try {
    await clearAllNotifications();

    if (
      !medications ||
      !Array.isArray(medications) ||
      medications.length === 0
    ) {
      console.log('No medications to schedule notifications for');
      return false;
    }

    const results = await Promise.all(
      medications.map(med => scheduleMedicationReminders(med)),
    );

    const totalScheduled = results.reduce((sum, ids) => sum + ids.length, 0);

    console.log(
      `Successfully scheduled ${totalScheduled} notifications for ${medications.length} medications`,
    );
    return true;
  } catch (error) {
    console.error('Error refreshing notifications:', error);
    return false;
  }
};
