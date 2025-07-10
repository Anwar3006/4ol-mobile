import moment from 'moment';
import {supabase} from '../utils/supabaseClient';

export const storeMedicationDetails = async (
  medicationData: any,
  id: any,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  console.log('id : inside', id.userid);
  const userId = id.userid;

  try {
    loadCallback();
    const {data, error} = await supabase
      .from('medications')
      .insert([medicationData])
      .eq('id', userId);

    console.log('error server', error);
    if (error) {
      errorCallback(new Error('Failed to fetch medication details'));
      return;
    }
    //console.log('~ data inside medication :', data);
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const updateMedicationDetails = async (
  medicationData: any,
  id: any,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  console.log('id inside', id);
  console.log('medicationData update data: ', medicationData.user_id);

  try {
    loadCallback();

    // Update the medication details
    const {data, error} = await supabase
      .from('medications')
      .update(medicationData)
      .eq('id', id); // Match the row with this ID (update condition)
    // .eq('user_id', userid); // Ensure it's for the right user

    console.log('error server', error);
    if (error) {
      errorCallback(new Error('Failed to update medication details'));
      return;
    }

    //console.log('~ data inside medication update:', data);
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const fetchMedicationReminders = async (user_id: string) => {
  const {data, error} = await supabase
    .from('medications')
    .select(
      'intake_times, medication_name, medication_description, dose_quantity, mg_dose_quantity',
    )
    .eq('user_id', user_id)
    .limit(2);

  if (error) {
    throw new Error('Failed to fetch medication details');
  }

  return data;
};

export const addMedicationReminder = async (
  user_id: string,
  medicationData: any,
) => {
  try {
    const {data, error} = await supabase
      .from('medication_reminders')
      .insert(medicationData);

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Full error stack:', error);
    throw error;
  }
};

export const fetchMedicationDetails = async (user_id: string) => {
  const {data, error} = await supabase
    .from('medication_reminders')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', {ascending: false});

  if (error) {
    throw new Error('Failed to fetch medication details');
  }

  return data;
};

export const createNotes = async (user_id: string, medicationData: any) => {
  const {error} = await supabase
    .from('notes')
    .insert(medicationData)
    .eq('user_id', user_id);
  if (error) {
    console.error('Failed to create notes', error);
  }
};

export const fetchNotes = async (user_id: string) => {
  const {data, error} = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user_id);

  if (error) {
    throw new Error('Failed to fetch notes');
  }

  return data;
};

export const addMedicationReminderToNotificationsTable = async (
  user_id: string,
  notification_data,
) => {
  const {data, error} = await supabase
    .from('notifications')
    .insert(notification_data)
    .eq('user_id', user_id)
    .select('id');

  if (error) {
    console.error('Error inserting notification record:', error);
  }

  return data;
};

export const updateMedicationReminderToNotificationsTable = async (
  notification_id: string,
  notification_data: {is_seen: boolean; updated_at: number},
) => {
  console.log('running updateMedicationReminderToNotificationsTable');
  console.log('notification_id', notification_id);

  try {
    // Skip if notification_id is not a valid format
    if (!notification_id || notification_id.includes('_')) {
      console.warn('Invalid notification ID format, skipping update');
      return null;
    }

    const {data, error} = await supabase
      .from('notifications')
      .update(notification_data)
      .eq('id', notification_id)
      .select();

    if (error) {
      console.error('Error updating notification record:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(
      'Error in updateMedicationReminderToNotificationsTable:',
      error,
    );
    return null;
  }
};
