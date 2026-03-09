import {supabase} from '../../lib/supabase';

export const getMapMarkerDetails = async ({
  region = null,
  district = null,
  facilityType = null,
}) => {
  let query = supabase
    .from('healthcare_profiles')
    .select(
      'id, facility_name, latitude, area, district, longitude, gps_address, facility_type, approved_at, mediaUrls, business_hours, avg_rating',
    )
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .eq('status', 'Approved');

  if (region) {
    query = query.eq('region', region);
  }

  if (district) {
    query = query.eq('district', district);
  }

  if (facilityType) {
    query = query.eq('facility_type', facilityType);
  }

  const {data, error} = await query;

  if (error) {
    console.error('Error fetching map marker data:', error);
    throw error;
  }

  return data;
};

// You can also export other related functions here
export const getAllRegions = async () => {
  const {data, error} = await supabase
    .from('healthcare_profiles')
    .select('region, district')
    .not('region', 'is', null);

  if (error) {
    console.error('Error fetching regions:', error);
    throw error;
  }

  // List of all Ghana regions
  const allGhanaRegions = [
    'Ahafo',
    'Ashanti',
    'Bono',
    'Bono East',
    'Central',
    'Eastern',
    'Greater Accra',
    'North East',
    'Northern',
    'Oti',
    'Savannah',
    'Upper East',
    'Upper West',
    'Volta',
    'Western',
    'Western North',
  ];

  // Initialize regionDistrictMap with all Ghana regions
  const regionDistrictMap = {};
  allGhanaRegions.forEach(region => {
    regionDistrictMap[region] = [];
  });

  // Process the data to add districts to their respective regions
  data.forEach(item => {
    if (!item.region) return;

    const region = item.region.trim();
    const district = item.district ? item.district.trim() : '';

    // Add region if it doesn't exist in regionDistrictMap (not in allGhanaRegions)
    if (!regionDistrictMap[region]) {
      regionDistrictMap[region] = [];
    }

    // Only add non-empty districts that aren't already in the array
    if (district && !regionDistrictMap[region].includes(district)) {
      regionDistrictMap[region].push(district);
    }
  });

  // Add "No districts" for regions with empty arrays
  Object.keys(regionDistrictMap).forEach(region => {
    if (regionDistrictMap[region].length === 0) {
      regionDistrictMap[region] = ['No districts'];
    } else {
      // Sort districts within each region
      regionDistrictMap[region].sort();
    }
  });
  return regionDistrictMap;
};

export const getFacilityTypes = async () => {
  const {data, error} = await supabase
    .from('healthcare_profiles')
    .select('facility_type', {count: 'exact', head: false});

  if (error) {
    console.error('Error fetching facility types:', error);
    throw error;
  }

  // Extract unique facility types
  const facilityTypesSet = new Set();

  data.forEach(item => {
    if (item.facility_type) {
      facilityTypesSet.add(item.facility_type.trim());
    }
  });

  // Convert set to sorted array if needed
  const facilityTypes = Array.from(facilityTypesSet).sort();

  return facilityTypes;
};

// Export all functions as a service object
const MapService = {
  getFacilityTypes,
  getMapMarkerDetails,
  getAllRegions,
};

export default MapService;
