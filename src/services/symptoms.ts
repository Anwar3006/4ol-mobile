import {limit} from '../../config/variables';
import {supabase} from '../utils/supabaseClient';

export const getSymptomsListByType = async (
  type: string,
  offset: number,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {data, error} = await supabase
      .from('symptoms')
      .select('id, symptom_name')
      .ilike('list_type', `%${type}%`)
      .range(offset, offset + limit - 1);
    if (error) {
      errorCallback(new Error('Failed to fetch symptoms list'));
      return;
    }
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const getSymptomDetailsById = async (
  id: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {data, error} = await supabase
      .from('symptoms')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      errorCallback(new Error('Failed to fetch symptom details'));
      return;
    }
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};
