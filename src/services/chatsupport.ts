import { supabase } from "../utils/supabaseClient";

export const sendMessage = async (
  data: any,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {data: insertData, error} = await supabase
      .from('chat_support')
      .insert([data])
    if (error) {
      errorCallback(new Error('Failed to send message'));
      return;
    }
    successCallback(insertData);
  } catch (err) {
    errorCallback(err as Error);
  }
};