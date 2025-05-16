import {supabase} from '../utils/supabaseClient';

export const tables = [
  {
    illness_and_conditions: [
      'id',
      'condition_name',
      'about',
      'diagnosis',
      'complications',
      'symptoms',
      'treating',
      'prevention',
      'more_information',
    ],
  },
  {
    symptoms: [
      'id',
      'symptom_name',
      'about',
      'diagnosis',
      'treating',
      'complications',
      'prevention',
      'more_information',
    ],
  },
  {
    healthy_living: [
      'id',
      'topic_name',
      'about',
      'category',
      'more_information',
    ],
  },
  {
    healthcare_profiles: [
      'id',
      'facility_name',
      'facility_type',
      'region',
      'district',
      'area',
      'street',
      'hospital_services',
      'hospital_amenities',
      'pharmacy_services',
      'keywords',
      'first_name',
      'last_name',
      'person_contact_number',
    ],
  },
];
export const searchAllTables = async (
  keyword: string,
): Promise<Array<{table: string; results: any[]}>> => {
  // Don't search if keyword is empty
  if (!keyword || keyword.trim() === '') {
    return [];
  }

  const results = [];
  const arrayFields = [
    'hospital_services',
    'hospital_amenities',
    'pharmacy_services',
  ];

  for (const table of tables) {
    const tableName = Object.keys(table)[0];
    const columns: string[] = table[tableName];

    // Split columns into regular text columns and array columns
    const textColumns = columns.filter(
      column => column !== 'id' && !arrayFields.includes(column),
    );

    const tableArrayFields = columns.filter(column =>
      arrayFields.includes(column),
    );

    // Build filter expressions for text columns using ilike (skip null checks in query)
    const textFilters = textColumns
      .filter(column => typeof column === 'string')
      .map((column: string) => `${column}.ilike.%${keyword}%`);

    // Build array containment filter expressions with null safety
    const arrayFilters = tableArrayFields.map(
      (column: string) => `${column}.cs.{${keyword}}`,
    );

    // Combine all filter expressions
    const allFilters = [...textFilters, ...arrayFilters].join(',');

    console.log(`Searching ${tableName} with filters:`, allFilters);

    try {
      const {data, error} = await supabase
        .from(tableName)
        .select(columns.join(','))
        .or(allFilters)
        .order('created_at', {ascending: false})
        .limit(3);

      if (error) {
        console.error(`Failed to fetch results from ${tableName}:`, error);
        continue;
      }

      if (data && data.length > 0) {
        // Improved filtering with null/empty checks
        const filteredData = data.filter((row: any) => {
          // Text column check with null safety
          const textMatch = textColumns.some(column => {
            // Check if the column exists and isn't null/undefined/empty
            return (
              row[column] != null &&
              row[column].toString().trim() !== '' &&
              row[column]
                .toString()
                .toLowerCase()
                .includes(keyword.toLowerCase())
            );
          });

          // Array column check with null safety
          const arrayMatch = tableArrayFields.some(column => {
            // Check if the array exists and isn't empty
            return (
              Array.isArray(row[column]) &&
              row[column].length > 0 &&
              row[column].some(
                (item: any) =>
                  item != null &&
                  item.toString().toLowerCase().includes(keyword.toLowerCase()),
              )
            );
          });

          return textMatch || arrayMatch;
        });

        if (filteredData.length > 0) {
          results.push({table: tableName, results: filteredData});
        }
      }
    } catch (e) {
      console.error(`Exception while searching ${tableName}:`, e);
    }
  }

  return results;
};
