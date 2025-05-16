import axios from 'axios';
import {notification_api_url} from '../constants';
import {supabase} from '../utils/supabaseClient';
import {limit} from '../../config/variables';

export const notification_firebase_api = async () => {
  try {
    const response = await axios.post(notification_api_url);
    console.log(response.data);
    return response;
  } catch (error) {
    console.log('error sending notifications', error);
  }
};

export const getNotifications = async (
  userId: string,
  offset: number,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {data, error} = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', {ascending: false})
      .range(offset, offset + limit - 1)
      .eq('user_id', userId);
    if (error) {
      errorCallback(new Error('Failed to fetch notifications list'));
      return;
    }
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const handleNotificationSeen = async (
  notificationId: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {data, error} = await supabase
      .from('notifications')
      .update({is_seen: true}) // Set is_seen to true
      .eq('id', notificationId); // Match the notification by ID

    if (error) {
      errorCallback(new Error('Failed to mark notification as seen'));
      return;
    }

    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const handleUpdateTrackerLogsAlerts = async (
  userId: string,
  isEnabled: boolean,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {data, error} = await supabase
      .from('user_profiles')
      .update({is_tracker_notifications_enabled: isEnabled})
      .eq('id', userId);

    if (error) {
      errorCallback(new Error('Failed to update alerts'));
      return;
    }

    const {data: updatedUser, error: updateError} = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (updateError) {
      errorCallback(new Error('Failed to update user'));
      return;
    }

    successCallback(updatedUser);
  } catch (err) {
    errorCallback(err as Error);
  }
};
