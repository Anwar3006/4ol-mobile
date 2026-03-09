/**
 * medicationReminderService.ts
 *
 * Core medication notification scheduling service.
 * Previously used @notifee/react-native — fully replaced with expo-notifications.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

interface IntakeTime {
  schedule_dates: string;
  schedule_times: string[];
  utc_schedule_dates: string;
  utc_schedule_times: string[];
  utcTime: string;
  status: string;
}

interface MedicationReminderData {
  medication_name: string;
  medication_description: string;
  days: string;
  user_id: string;
  type: 'schedule' | 'intervalIntake';
  intake_times: IntakeTime[];
  every_x_hour: number;
  dose_quantity: number;
  mg_dose_quantity: number;
  start_date: string;
  end_date: string;
  regular_notifications: boolean;
  intake_days?: number | null;
  week_days?: string[] | null;
  medicine_type: string;
  color: string;
}

const CHANNEL_ID = 'medication_reminders';

/**
 * Schedules all notifications for a single medication reminder record.
 * Returns true when at least one notification was successfully scheduled.
 */
export const scheduleMedicationNotifications = async (
  data: MedicationReminderData,
): Promise<boolean> => {
  try {
    // Ensure Android channel exists
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Medication Reminders',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
      });
    }

    const currentTime = Date.now();
    const startDate = new Date(data.start_date).getTime();
    const endDate = new Date(data.end_date).getTime() + 86_400_000; // include end day
    let scheduledCount = 0;

    for (const intake of data.intake_times) {
      for (const utcTime of intake.utc_schedule_times) {
        const notificationTime = new Date(utcTime).getTime();

        // Skip past times
        if (notificationTime <= currentTime) continue;

        // Skip times outside the medication's date range
        if (notificationTime < startDate || notificationTime > endDate) continue;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Medication Reminder: ${data.medication_name}`,
            body: `Time to take ${data.dose_quantity} ${data.medicine_type}`,
            sound: 'default',
            data: {
              type: 'medication-reminder',
              medication_name: data.medication_name,
            },
            ...(Platform.OS === 'android' && {
              android: { channelId: CHANNEL_ID },
            }),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(notificationTime),
          },
        });

        scheduledCount++;
      }
    }

    console.log(`[MedicationReminder] Scheduled ${scheduledCount} notifications`);
    return scheduledCount > 0;
  } catch (error) {
    console.error('[MedicationReminder] Error scheduling:', error);
    return false;
  }
};

/**
 * Cancels all scheduled notifications (e.g. when a medication is deleted).
 */
export const cancelAllMedicationNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
