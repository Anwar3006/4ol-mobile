import axios from 'axios';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import {supabase} from '../utils/supabaseClient';

export const logActivity = async (
  activity: {
    user_id: string;
    user_name: string;
    type: string;
    description: string;
    reference?: string;
    reference_id?: string;
    timestamp?: string;
  },
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
) => {
  try {
    loadCallback();
    activity.timestamp = moment().format('DD-MM-YYYY HH:mm:ss');
    const deviceInfo = {
      deviceId: DeviceInfo.getDeviceId() || '',
      deviceName: (await DeviceInfo.getDeviceName()) || '',
      systemName: DeviceInfo.getSystemName() || '',
      systemVersion: DeviceInfo.getSystemVersion() || '',
      model: DeviceInfo.getModel() || '',
      manufacturer: (await DeviceInfo.getManufacturer()) || '',
      isTablet: DeviceInfo.isTablet() || false,
    };
    const response = await axios.get('https://api.ipify.org?format=json');
    const ip = response?.data?.ip || '';
    const activityLog = {
      ...activity,
      ip,
      device_info: deviceInfo,
      created_at: moment(new Date()).valueOf(),
      updated_at: moment(new Date()).valueOf(),
      created_by: activity.user_id,
      updated_by: activity.user_id,
      is_created_by_admin_panel: false,
    };
    const {data, error} = await supabase
      .from('activity_logs')
      .insert([activityLog]);
    if (error) {
      errorCallback(new Error('Failed to log activity'));
      return;
    }
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const getActivitiesByDateRange = async (
  startDate: string,
  endDate: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const formattedStartDate = moment(startDate)
      .startOf('day')
      .format('DD-MM-YYYY HH:mm:ss');
    const formattedEndDate = moment(endDate)
      .endOf('day')
      .format('DD-MM-YYYY HH:mm:ss');
    const {data, error} = await supabase
      .from('activity_logs')
      .select('*')
      .gte('timestamp', formattedStartDate)
      .lte('timestamp', formattedEndDate);
    if (error) {
      errorCallback(new Error('Failed to fetch activity logs'));
      return;
    }
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};
