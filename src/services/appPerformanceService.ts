import moment from 'moment';
import {supabase} from '../../lib/supabase';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const logDAU = async (
  userId: string,
  gender: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
) => {
  loadCallback();

  try {
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

    // Check if the record exists
    const { data: existingRecord, error: selectError } = await supabase
      .from('daily_active_users')
      .select('*')
      .eq('user_id', userId)
      .eq('date', moment().format('YYYY-MM-DD'))
      .maybeSingle();

    if (selectError) {
      // Handle error if not "No rows found" error
      return errorCallback(selectError);
    }

    if (existingRecord) {
      // Update existing record
      const { data: updatedData, error: updateError } = await supabase
        .from('daily_active_users')
        .update({
          last_active: moment().valueOf(),
          ip: ip,
          device_info: deviceInfo,
        })
        .eq('user_id', userId)
        .eq('date', moment().format('YYYY-MM-DD'));

      if (updateError) {
        return errorCallback(updateError);
      }

      return successCallback(updatedData);
    }

    // Insert new record if it doesn't exist
    const { data: insertedData, error: insertError } = await supabase
      .from('daily_active_users')
      .insert({
        user_id: userId,
        gender: gender,
        operating_system: Platform.OS,
        date: moment().format('YYYY-MM-DD'),
        last_active: moment().valueOf(),
        ip: ip,
        device_info: deviceInfo,
      });

    if (insertError) {
      return errorCallback(insertError);
    }

    successCallback(insertedData);
  } catch (err) {
    errorCallback(err);
  }
};


export const logMAU = async (
  userId: string,
  gender: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
) => {
  loadCallback();

  try {
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
    const currentMonth = moment().format('YYYY-MM');

    // Check if record exists
    const { data: existingRecord, error: selectError } = await supabase
      .from('monthly_active_users')
      .select('*')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .maybeSingle();

    if (selectError) {
      return errorCallback(selectError);
    }

    if (existingRecord) {
      // Update existing record
      const { data: updatedData, error: updateError } = await supabase
        .from('monthly_active_users')
        .update({
          last_active: moment().valueOf(),
          ip: ip,
          device_info: deviceInfo,
        })
        .eq('user_id', userId)
        .eq('month', currentMonth);

      if (updateError) {
        return errorCallback(updateError);
      }

      return successCallback(updatedData);
    }

    // Insert new record if it doesn't exist
    const { data: insertedData, error: insertError } = await supabase
      .from('monthly_active_users')
      .insert({
        user_id: userId,
        gender: gender,
        operating_system: Platform.OS,
        month: currentMonth,
        last_active: moment().valueOf(),
        ip: ip,
        device_info: deviceInfo,
      });

    if (insertError) {
      return errorCallback(insertError);
    }

    successCallback(insertedData);
  } catch (err) {
    errorCallback(err);
  }
};

export const logDownloads = async (
  userId: string,
  gender: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
) => {
  try {
    // Check if entry is already logged for the user
    const downloadLoggedKey = `downloadLogged_${userId}`;
    const isDownloadLogged = await AsyncStorage.getItem(downloadLoggedKey);

    if (isDownloadLogged) {
      console.log("Download already logged for this user.");
      return successCallback("Entry already exists");
    }

    loadCallback();

    // Collect device information
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
    const installDate = moment().format('YYYY-MM-DD');

    // Insert new record into downloads table
    const { data: insertedData, error: insertError } = await supabase
      .from('downloads')
      .insert({
        user_id: userId,
        gender: gender,
        operating_system: Platform.OS,
        install_date: installDate,
        ip: ip,
        device_info: deviceInfo,
      });

    if (insertError) {
      return errorCallback(insertError);
    }

    // Store flag in local storage to indicate download logging is complete
    await AsyncStorage.setItem(downloadLoggedKey, 'true');

    successCallback(insertedData);
  } catch (err) {
    errorCallback(err);
  }
};