import {THIS_IS_MAP_KEY, limit} from '../../config/variables';
import useLocation from '../hooks/useLocation';
import {supabase} from '../utils/supabaseClient';

export const getFacilityListByCategory = async (
  category: string,
  offset: number,
  location: any,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {data, error} = await supabase
      .from('facilities')
      .select('*')
      .ilike('type', `%${category}%`)
      .order('rating', {ascending: false})
      .range(offset, offset + limit - 1);
    if (error) {
      errorCallback(new Error('Failed to fetch facilities list'));
      return;
    }
    const updatedData: any = await Promise.all(
      data?.map(async (place: any) => {
        // const d = await getRatingsAndDistance(place?.facility_name, location);
        return {
          ...place,
          // ...d,
        };
      }),
    );
    successCallback(updatedData);
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const getTopRatedFacility = async (
  category: string,
  location: any,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {data, error} = await supabase
      .from('healthcare_profiles')
      .select('*')
      .ilike('facility_type', `%${category}%`)
      .order('facility_name', {ascending: false})
      .limit(4);

    if (error) {
      errorCallback(new Error('Failed to fetch top facility'));
      return;
    }
    const updatedData: any = await Promise.all(
      data?.map(async (place: any) => {
        // const d = await getRatingsAndDistance(place?.facility_name, location);
        return {
          ...place,
          // ...d,
        };
      }),
    );
    successCallback(updatedData);
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const getFacilityDetailsById = async (
  id: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {data, error} = await supabase
      .from('healthcare_profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      errorCallback(new Error('Failed to fetch facility details'));
      return;
    }
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};

const getRatingsAndDistance = async (placeName: string, location: any) => {
  try {
    let data = {
      distance: 0,
      photo: '',
    };
    // Step 1: Search for the place to get its place_id
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      placeName,
    )}&inputtype=textquery&fields=place_id&key=${THIS_IS_MAP_KEY}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.status === 'OK' && searchData.candidates.length > 0) {
      const placeId = searchData.candidates[0].place_id;

      // Step 2: Use the place_id to get complete details
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry,photo&key=${THIS_IS_MAP_KEY}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      if (detailsData.status === 'OK') {
        const result = detailsData.result;

        // Helper function to build photo URL
        const buildPhotoUrl = (photoReference: string) =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${THIS_IS_MAP_KEY}`;

        const distance = await fetchDistanceAndDuration(
          {
            lat: location?.latitude || 0,
            lng: location?.longitude || 0,
          },
          result.geometry ? result.geometry.location : {lat: 0, lng: 0},
        );
        data = {
          photo: result?.photos
            ? buildPhotoUrl(result?.photos[0]?.photo_reference)
            : '',
          distance,
        };
      } else {
        console.log('Place details request failed:', detailsData.status);
        if (detailsData.error_message) {
          console.log('Error Message:', detailsData.error_message);
        }
      }
    } else {
      console.log('Place search failed:', searchData.status);
      if (searchData.error_message) {
        console.log('Error Message:', searchData.error_message);
      }
    }
    return data;
  } catch (error) {
    console.log('Error fetching data:', error);
  }
};

const fetchDistanceAndDuration = async (
  origin: {lat: number; lng: number},
  destination: {lat: number; lng: number},
) => {
  try {
    let distance: any;
    const distanceMatrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${THIS_IS_MAP_KEY}`;
    const response = await fetch(distanceMatrixUrl);
    const data = await response.json();

    if (data.status === 'OK') {
      const element = data.rows[0].elements[0];
      if (element.status === 'OK') {
        distance = element.distance.text;
      } else {
        console.log('Distance Matrix API response status: 1', element.status);
      }
    } else {
      console.log('Distance Matrix API response status: 2', data.status);
    }
    return distance;
  } catch (error) {
    console.log('Error fetching distance and duration:', error);
  }
};

export const getRegisteredFacilities = async (
  offset: number,
  category?: string | null,
  region?: string | null,
  district?: string | null,
) => {
  let query = supabase
    .from('healthcare_profiles')
    .select(
      'id, facility_name, latitude, longitude, gps_address, facility_type, hospital_services, hospital_amenities, mediaUrls, business_hours',
    )
    .neq('status', 'Pending')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .not('facility_name', 'is', null)
    .order('facility_name', {ascending: true})
    .range(offset, offset + limit - 1);

  if (region) {
    query = query.eq('region', region);
  }

  if (district) {
    query = query.eq('district', district);
  }

  if (category) {
    query = query.ilike('facility_type', `%${category}%`);
  }

  const {data, error} = await query;

  if (error) {
    throw new Error('Failed to fetch facilities list');
  }

  return data;
};

export const getTopRatedRegisteredFacilities = async (
  offset: number,
  category?: string | null,
  region?: string | null,
  district?: string | null,
  sortBy:
    | 'rating-desc'
    | 'rating-asc'
    | 'name-asc'
    | 'name-desc' = 'rating-desc',
) => {
  try {
    // First, fetch all the healthcare facilities matching our criteria
    let query = supabase
      .from('healthcare_profiles')
      .select(
        'id, facility_name, latitude, longitude, gps_address, facility_type, hospital_services, hospital_amenities, mediaUrls, business_hours',
      )
      .neq('status', 'Pending')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .not('facility_name', 'is', null);

    // The initial sort will depend on the requested sort method
    if (sortBy === 'name-asc') {
      query = query.order('facility_name', {ascending: true});
    } else if (sortBy === 'name-desc') {
      query = query.order('facility_name', {ascending: false});
    } else {
      // For rating sorts, we'll sort after fetching the data
      query = query.order('facility_name', {ascending: true});
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Apply additional filters
    if (region) {
      query = query.eq('region', region);
    }

    if (district) {
      query = query.eq('district', district);
    }

    if (category) {
      query = query.ilike('facility_type', `%${category}%`);
    }

    const {data: facilities, error: facilitiesError} = await query;

    if (facilitiesError) {
      throw new Error('Failed to fetch facilities list');
    }

    if (!facilities || facilities.length === 0) {
      return [];
    }

    // Extract all facility IDs for a single ratings query
    const facilityIds = facilities.map(facility => facility.id);

    // Fetch all ratings for these facilities in a single query
    const {data: allRatings, error: ratingsError} = await supabase
      .from('facility_ratings')
      .select('facility_id, rating')
      .in('facility_id', facilityIds);

    if (ratingsError) {
      console.error('Error fetching ratings:', ratingsError);
      // Continue with zero ratings rather than failing
    }

    // Group ratings by facility_id
    const ratingsMap: Record<string, number[]> = {};

    if (allRatings && allRatings.length > 0) {
      allRatings.forEach(rating => {
        const facilityId = rating.facility_id;
        if (!ratingsMap[facilityId]) {
          ratingsMap[facilityId] = [];
        }
        ratingsMap[facilityId].push(Number(rating.rating));
      });
    }

    // Calculate average rating for each facility
    const facilitiesWithRatings = facilities.map(facility => {
      const ratings = ratingsMap[facility.id] || [];
      let avgRating = 0;

      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, rating) => acc + rating, 0);
        avgRating = Number((sum / ratings.length).toFixed(1));
      }

      return {
        ...facility,
        avg_rating: avgRating,
        ratings_count: ratings.length,
      };
    });

    // Sort based on the requested sort method
    if (sortBy === 'rating-desc') {
      facilitiesWithRatings.sort((a, b) => b.avg_rating - a.avg_rating);
    } else if (sortBy === 'rating-asc') {
      facilitiesWithRatings.sort((a, b) => a.avg_rating - b.avg_rating);
    }
    // For name-asc and name-desc, we already sorted in the initial query

    return facilitiesWithRatings;
  } catch (error) {
    console.error('Error in getTopRatedRegisteredFacilities:', error);
    throw error;
  }
};

export const getFacilityRatings = async () => {
  const {data, error} = await supabase
    .from('healthcare_profiles')
    .select(`id, facility_name, facility_ratings (rating.avg())`);

  if (error) {
    console.error('Error fetching facility ratings:', error);
  }
  return data;
};
