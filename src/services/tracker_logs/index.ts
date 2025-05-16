import {supabase} from '../../utils/supabaseClient';

export const store_periodTracker_Details = async (
  period_Tracker_Data: any,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  console.log('periodTrackerData :', period_Tracker_Data);
  try {
    loadCallback();
    const {data, error} = await supabase
      .from('tracker_logs')
      .insert([period_Tracker_Data])
      .eq('user_id', period_Tracker_Data.user_id)
      .select('*');

    console.log('error server', error);
    if (error) {
      errorCallback(new Error('Failed to fetch poeriod details'));
      return;
    }
    //console.log('~ data inside peirod :', data);
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const update_periodTracker_Details = async (
  update_period_Tracker_Data: any,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  console.log('update_period_Tracker_Data :', update_period_Tracker_Data);
  try {
    loadCallback();
    const {data, error} = await supabase
      .from('tracker_logs')
      .update([update_period_Tracker_Data])
      .eq('user_id', update_period_Tracker_Data.user_id)
      .select('*');

    console.log('error server', error);
    if (error) {
      errorCallback(new Error('Failed to fetch poeriod details'));
      return;
    }
    //console.log('~ data inside peirod :', data);
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};
