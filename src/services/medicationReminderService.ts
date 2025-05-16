import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidImportance,
} from '@notifee/react-native';

interface IntakeTime {
  schedule_dates: string;
  schedule_times: string[];
  utc_schedule_dates: string;
  utc_schedule_times: string[]; // Use UTC times directly
  utcTime: string;
  status: string;
}

// Define the main medication reminder data structure
interface MedicationReminderData {
  medication_name: string;
  medication_description: string;
  days: string; // e.g., "Every day"
  user_id: string;
  type: 'schedule' | 'intervalIntake';
  intake_times: IntakeTime[];
  every_x_hour: number;
  dose_quantity: number;
  mg_dose_quantity: number;
  start_date: string; // overall start date (e.g., "2025-03-05")
  end_date: string; // overall end date (e.g., "2025-03-12")
  regular_notifications: boolean;
  intake_days?: number | null;
  week_days?: string[] | null;
  medicine_type: string;
  color: string;
}

// Main scheduling function
export const scheduleMedicationNotifications = async (
  data: MedicationReminderData,
): Promise<boolean> => {
  try {
    const channelId = await notifee.createChannel({
      id: 'medication_reminders',
      name: 'Medication Reminders',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    const currentTime = Date.now();
    let scheduledCount = 0;

    for (const intake of data.intake_times) {
      // Use UTC times directly
      for (const utcTime of intake.utc_schedule_times) {
        const notificationTime = new Date(utcTime).getTime();

        if (notificationTime <= currentTime) {
          continue; // Skip past times
        }

        // Check if the time is within start_date and end_date
        const startDate = new Date(data.start_date).getTime();
        const endDate = new Date(data.end_date).getTime() + 86400000; // Include end day

        if (notificationTime < startDate || notificationTime > endDate) {
          continue;
        }

        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: notificationTime,
        };

        await notifee.createTriggerNotification(
          {
            title: `Medication Reminder: ${data.medication_name}`,
            body: `Time to take ${data.dose_quantity} ${data.medicine_type}`,
            android: {channelId},
          },
          trigger,
        );

        scheduledCount++;
      }
    }

    console.log(`Scheduled ${scheduledCount} notifications`);
    return scheduledCount > 0;
  } catch (error) {
    console.error('Error scheduling:', error);
    return false;
  }
};
// Function to cancel all scheduled notifications
export const cancelAllMedicationNotifications = async (): Promise<void> => {
  await notifee.cancelAllNotifications();
};
