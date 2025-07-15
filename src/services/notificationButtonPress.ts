import {Alert} from 'react-native';
import {supabase} from '../utils/supabaseClient';
import {refreshAllNotifications} from './scheduleNotifications';
import {stat} from 'react-native-fs';

export const markasComplete = async (medicationId: any) => {
  try {
    const {error} = await supabase
      .from('medication_reminders')
      .update({status: 'completed'})
      .eq('id', medicationId);

    if (error) {
      console.error('Failed to update status', error);
    } else {
      Alert.alert('Medication Reminder', 'Marked as Completed', [{text: 'OK'}]);
      // Optionally, you can show a toast or notification here
      // toast.show('Marked as Completed', {
      //   type: 'success',
      //   placement: 'top',
      //   duration: 4000,
      //   animationType: 'slide-in',
      // });
    }
  } catch (error) {
    console.error('Error updating status:', error);
  }
};

export const markasSkip = async (medicationId: any) => {
  try {
    const {error} = await supabase
      .from('medication_reminders')
      .update({status: 'skipped'})
      .eq('id', medicationId);

    if (error) {
      console.error('Failed to update status', error);
    } else {
      Alert.alert('Medication Reminder', 'Marked as Skipped', [{text: 'OK'}]);
    }
  } catch (error) {
    console.error('Error updating status:', error);
  }
};

// export const markasSnooze = async (medicationId: any, delayMs = 60000) => {
//   try {
//     // 1. Fetch the current medication data
//     const {data: medicationData, error: medicationError} = await supabase
//       .from('medication_reminders')
//       .select('*')
//       .eq('id', medicationId)
//       .single();

//     if (medicationError) {
//       console.error('Failed to fetch medication data', medicationError);
//       return false;
//     }

//     if (!medicationData) {
//       console.error('No medication found with this ID');
//       return false;
//     }

//     // 2. Find and update the correct timestamp in the array
//     const currentTimestamps: string[] =
//       medicationData.reminder_timestamps || [];
//     const now = new Date();
//     let updatedTimestamps = [...currentTimestamps];

//     // Find the timestamp that's closest to the current time (the one that just triggered)
//     let closestIndex = -1;
//     let smallestDiff = Infinity;

//     currentTimestamps.forEach((timestamp, index) => {
//       const timeDiff = Math.abs(new Date(timestamp).getTime() - now.getTime());
//       if (timeDiff < smallestDiff) {
//         smallestDiff = timeDiff;
//         closestIndex = index;
//       }
//     });

//     if (closestIndex === -1) {
//       console.error('No matching timestamp found to snooze');
//       return false;
//     }

//     // Calculate the new time by adding the delay
//     const originalTime = new Date(currentTimestamps[closestIndex]);
//     const newTime = new Date(originalTime.getTime() + delayMs);
//     updatedTimestamps[closestIndex] = newTime.toISOString();

//     // 3. Update the database with the new timestamps
//     const {error: updateError} = await supabase
//       .from('medication_reminders')
//       .update({reminder_timestamps: updatedTimestamps, status: 'snoozed'})
//       .eq('id', medicationId);

//     if (updateError) {
//       console.error('Failed to update medication timestamps', updateError);
//       return false;
//     } else {
//       Alert.alert('Medication Reminder', 'Marked as Snoozed', [{text: 'OK'}]);
//     }

//     // 4. Prepare the updated data to reschedule notifications
//     const updatedMedicationData = {
//       ...medicationData,
//       reminder_timestamps: updatedTimestamps,
//     };

//     // 5. Reschedule the notification using your notification service
//     // Assuming you have a function to handle single notification updates
//     await refreshAllNotifications([updatedMedicationData]);

//     return true;
//   } catch (error) {
//     console.error('Error in markasSnooze:', error);
//     return false;
//   }
// };

export const markasSnooze = async (medicationId: any, delayMs = 900000) => {
  try {
    // 1. Fetch the current medication data
    const {data: medicationData, error: medicationError} = await supabase
      .from('medication_reminders')
      .select('*')
      .eq('id', medicationId)
      .single();

    if (medicationError) {
      console.error('Failed to fetch medication data', medicationError);
      return false;
    }

    if (!medicationData) {
      console.error('No medication found with this ID');
      return false;
    }

    // 2. Find and update the correct timestamp in the array
    const currentTimestamps: string[] =
      medicationData.reminder_timestamps || [];
    const now = new Date();
    let updatedTimestamps = [...currentTimestamps];

    // Find the most recent past timestamp (the one that triggered the notification)
    let mostRecentPastIndex = -1;
    let mostRecentPastTime = new Date(0); // Earliest possible date

    currentTimestamps.forEach((timestamp, index) => {
      const timestampDate = new Date(timestamp);
      if (timestampDate <= now && timestampDate > mostRecentPastTime) {
        mostRecentPastTime = timestampDate;
        mostRecentPastIndex = index;
      }
    });

    // If no past timestamp found, find the closest future timestamp
    if (mostRecentPastIndex === -1) {
      let closestFutureIndex = -1;
      let smallestFutureDiff = Infinity;

      currentTimestamps.forEach((timestamp, index) => {
        const timeDiff = new Date(timestamp).getTime() - now.getTime();
        if (timeDiff > 0 && timeDiff < smallestFutureDiff) {
          smallestFutureDiff = timeDiff;
          closestFutureIndex = index;
        }
      });

      mostRecentPastIndex = closestFutureIndex;
    }

    if (mostRecentPastIndex === -1) {
      console.error('No matching timestamp found to snooze');
      return false;
    }

    // Calculate the new time based on current time + delay
    const newTime = new Date(now.getTime() + delayMs);
    updatedTimestamps[mostRecentPastIndex] = newTime.toISOString();

    // 3. Update the database with the new timestamps
    const {error: updateError} = await supabase
      .from('medication_reminders')
      .update({
        reminder_timestamps: updatedTimestamps,
        status: 'snoozed',
      })
      .eq('id', medicationId);

    if (updateError) {
      console.error('Failed to update medication timestamps', updateError);
      return false;
    } else {
      Alert.alert('Medication Reminder', 'Marked as Snoozed', [{text: 'OK'}]);
    }

    // 4. Prepare the updated data to reschedule notifications
    const updatedMedicationData = {
      ...medicationData,
      reminder_timestamps: updatedTimestamps,
    };

    // 5. Reschedule the notification
    await refreshAllNotifications([updatedMedicationData]);

    return true;
  } catch (error) {
    console.error('Error in markasSnooze:', error);
    return false;
  }
};
