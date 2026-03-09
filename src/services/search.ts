import {supabase} from '../../lib/supabase';

export const searchDiseasesORSymptoms = async (
  search_text: string,
  type: string, // 'diseases' or 'symptoms'
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const diseaseColumnNames = [
      'id',
      'condition_name',
      'diagnosis',
      'about',
      'treating',
      'complications',
      'symptoms',
      'prevention',
      'specialist_to_contact',
      'contact_your_doctor',
      'more_information',
      'about',
      'attribution',
    ];

    const symptomColumnNames = [
      'id',
      'symptom_name',
      'about',
      'diagnosis',
      'treating',
      'complications',
      'prevention',
      'specialist_to_contact',
      'contact_your_doctor',
      'more_information',
      'attribution',
    ];

    const columnNames =
      type === 'diseases' ? diseaseColumnNames : symptomColumnNames;
    const tableName =
      type === 'diseases' ? 'illness_and_conditions' : 'symptoms';

    const orFilters = columnNames
      .filter(column => column !== 'id')
      .map(column => `${column}.ilike.%${search_text}%`)
      .join(',');

    const {data, error} = await supabase
      .from(tableName)
      .select(columnNames.join(','))
      .or(orFilters)
      .order(columnNames[0], {ascending: true});

    if (error) {
      errorCallback(new Error('Failed to fetch results'));
      console.error('Failed dd:', error);
      return;
    }
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};
