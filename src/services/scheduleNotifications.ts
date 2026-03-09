/**
 * scheduleNotifications.ts
 *
 * Local medication reminder scheduling.
 * Previously used @notifee/react-native — fully replaced with expo-notifications.
 *
 * Key mapping:
 *   notifee.createChannel()             → Notifications.setNotificationChannelAsync()
 *   notifee.createTriggerNotification() → Notifications.scheduleNotificationAsync()
 *   notifee.getTriggerNotifications()   → Notifications.getAllScheduledNotificationsAsync()
 *   notifee.cancelNotification()        → Notifications.cancelScheduledNotificationAsync()
 *   notifee.getChannels()               → (not needed — expo manages channels internally)
 */

import * as Notifications from 'expo-notifications';
import moment from 'moment';
import { Platform } from 'react-native';
import { themeColors } from '../../src/theme/colors';
import { ensureNotificationPermission } from '../utils/permissions';

// ─── Channel IDs ─────────────────────────────────────────────────────────────
const MEDICATION_CATEGORY_ID = 'medication_actions';

// ─── Set up notification categories (action buttons) once ────────────────────
/**
 * Call this once at app startup (e.g. in _layout.tsx).
 * Sets up the iOS notification categories and Android action buttons for
 * medication reminders (Complete / Skip / Snooze).
 */
export const setupNotificationCategories = async (): Promise<void> => {
  await Notifications.setNotificationCategoryAsync(MEDICATION_CATEGORY_ID, [
    {
      identifier: 'complete',
      buttonTitle: 'Complete',
      options: { isDestructive: false, isAuthenticationRequired: false },
    },
    {
      identifier: 'skip',
      buttonTitle: 'Skip',
      options: { isDestructive: false, isAuthenticationRequired: false },
    },
    {
      identifier: 'snooze',
      buttonTitle: 'Snooze (15m)',
      options: { isDestructive: false, isAuthenticationRequired: false },
    },
  ]);
};

// ─── Clear all scheduled notifications ───────────────────────────────────────
export const clearAllNotifications = async (): Promise<boolean> => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`[Notifications] Clearing ${scheduled.length} scheduled notifications`);

    await Promise.all(
      scheduled.map((n) =>
        Notifications.cancelScheduledNotificationAsync(n.identifier),
      ),
    );

    console.log('[Notifications] All scheduled notifications cleared');
    return true;
  } catch (error) {
    console.error('[Notifications] Error clearing notifications:', error);
    return false;
  }
};

// ─── Create (or refresh) an Android notification channel ─────────────────────
export const createMedicationChannel = async (
  medicationId: string,
  medicationName: string,
  color: string,
): Promise<string> => {
  if (Platform.OS !== 'android') {
    return `medication_${medicationId}`;
  }

  try {
    const channelId = `medication_${medicationId}`;

    await Notifications.setNotificationChannelAsync(channelId, {
      name: `${medicationName} Reminders`,
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: color || themeColors.primary,
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
    });

    return channelId;
  } catch (error) {
    console.error('[Notifications] Error creating channel:', error);
    return 'default';
  }
};

// ─── Parse timestamp helper ───────────────────────────────────────────────────
const parseTimestamp = (timestampStr: string): Date =>
  moment(timestampStr).toDate();

// ─── Type label helper ────────────────────────────────────────────────────────
const getTypeLabel = (type: string, count: number): string => {
  if (!type) return 'unit(s)';
  const isSingular = count === 1;

  switch (type.toUpperCase()) {
    case 'TABLET':    return isSingular ? 'tablet' : 'tablets';
    case 'CAPSULE':   return isSingular ? 'capsule' : 'capsules';
    case 'INJECTION': return isSingular ? 'injection' : 'injections';
    case 'SPRAY':     return isSingular ? 'spray' : 'sprays';
    case 'DROPS':     return 'drops';
    case 'SOLUTION':  return 'ml';
    case 'HERBS':     return isSingular ? 'sachet' : 'sachets';
    default:          return 'unit(s)';
  }
};

// ─── Schedule a single notification ──────────────────────────────────────────
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
): Promise<string | null> => {
  try {
    const date = parseTimestamp(timestamp);
    const now = new Date();

    if (date <= now) {
      console.log(`[Notifications] Skipping past timestamp for ${medicationName}: ${timestamp}`);
      return null;
    }

    let medicineInfo = '';
    if (dose) medicineInfo += `${dose} (dosage) `;
    if (amount) medicineInfo += `${amount} ${getTypeLabel(medicationType, amount)}`;

    const notificationIdentifier = `${medicationId}_${date.getTime()}`;

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: notificationIdentifier,
      content: {
        title: `Time to take ${medicationName}`,
        body: medicineInfo ? `Take ${medicineInfo}` : 'Time for your medication',
        sound: 'default',
        categoryIdentifier: MEDICATION_CATEGORY_ID,
        data: {
          type: 'medication-reminder',
          medicationId,
          screen: 'Details',
          medication_name: medicationName,
          medication_type: medicationType,
        },
        ...(Platform.OS === 'android' && {
          android: {
            channelId,
            color: color || '#9c27b0',
            smallIcon: 'ic_notification',
            ...(imageUrl && { largeIcon: imageUrl }),
          },
        }),
        ...(imageUrl && {
          attachments: [{ uri: imageUrl }],
        }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
    });

    console.log(`[Notifications] Scheduled "${medicationName}" at ${date.toLocaleString()} (id: ${notificationId})`);
    return notificationId;
  } catch (error: any) {
    console.error('[Notifications] Error scheduling notification:', error.message, error.stack);
    return null;
  }
};

// ─── Schedule all reminders for one medication ────────────────────────────────
export const scheduleMedicationReminders = async (medication: any): Promise<string[]> => {
  if (!medication?.id || !medication?.medication_name) {
    console.error('[Notifications] Invalid medication data');
    return [];
  }

  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
    console.warn(`[Notifications] Permission denied — skipping ${medication.medication_name}`);
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
      imageUrl,
    } = medication;

    if (!Array.isArray(reminder_timestamps) || reminder_timestamps.length === 0) {
      console.log(`[Notifications] No timestamps for ${medication_name}, skipping`);
      return [];
    }

    const channelId = await createMedicationChannel(id, medication_name, color);

    const ids = await Promise.all(
      reminder_timestamps.map((ts: string) =>
        scheduleNotification(
          id,
          medication_name,
          medication_type,
          ts,
          medication_amount,
          medication_dose,
          channelId,
          color,
          imageUrl,
        ),
      ),
    );

    const validIds = ids.filter((id): id is string => id !== null);
    return validIds;
  } catch (error) {
    console.error(`[Notifications] Error scheduling reminders for ${medication.medication_name}:`, error);
    return [];
  }
};

// ─── Refresh all notifications (clear then reschedule) ───────────────────────
export const refreshAllNotifications = async (medications: any[]): Promise<boolean> => {
  try {
    await clearAllNotifications();

    if (!Array.isArray(medications) || medications.length === 0) {
      console.log('[Notifications] No medications to schedule');
      return false;
    }

    const results = await Promise.all(medications.map(scheduleMedicationReminders));
    const totalScheduled = results.reduce((sum, ids) => sum + ids.length, 0);

    console.log(`[Notifications] Scheduled ${totalScheduled} notifications for ${medications.length} medications`);
    return true;
  } catch (error) {
    console.error('[Notifications] Error refreshing notifications:', error);
    return false;
  }
};
