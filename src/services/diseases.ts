import {limit} from '../../config/variables';
import {supabase} from '../utils/supabaseClient';

export const getDiseaseListByType = async (
  type: string,
  offset: number,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {data, error} = await supabase
      .from('illness_and_conditions')
      .select('id, condition_name')
      .ilike('list_type', `%${type}%`)
      .range(offset, offset + limit - 1);
    if (error) {
      errorCallback(new Error('Failed to fetch diseases list'));
      return;
    }
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const getDiseaseDetailsById = async (
  id: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {data, error} = await supabase
      .from('illness_and_conditions')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      errorCallback(new Error('Failed to fetch disease details'));
      return;
    }
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};
