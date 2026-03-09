import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from '../../lib/supabase';
import {limit} from '../../config/variables';

export const getFavoriteFacilities = async (page: number = 1) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const userId = await AsyncStorage.getItem('user_id');
    console.log('userId', userId);

    const {data, error} = await supabase
      .from('user_facility_favorite')
      .select('id, facility:healthcare_profiles(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching favorite facilities:', error);
    throw error;
  }
};

// Example of how to call the function with pagination
const fetchFavorites = async () => {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const favorites = await getFavoriteFacilities(page);
    if (favorites.length < limit) {
      hasMore = false;
    } else {
      page++;
    }
    // Process the favorites data
  }
};

export const deleteFavoriteFacility = async (facilityId: string) => {
  try {
    const userId = await AsyncStorage.getItem('user_id');
    const {data, error} = await supabase
      .from('user_facility_favorite')
      .delete()
      .eq('user_id', userId)
      .eq('facility_id', facilityId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting favorite facility:', error);
    throw error;
  }
};

export const addFavoriteFacility = async (facilityId: string) => {
  try {
    const userId = await AsyncStorage.getItem('user_id');
    const {data, error} = await supabase
      .from('user_facility_favorite')
      .insert([
        {
          user_id: userId,
          facility_id: facilityId,
        },
      ])
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding favorite facility:', error);
    throw error;
  }
};
export const getFacilityRating = async (facilityId: string) => {
  try {
    const {data, error} = await supabase
      .from('facility_ratings')
      .select('rating')
      .eq('facility_id', facilityId);

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    const average =
      data.reduce((sum, item) => sum + Number(item.rating), 0) / data.length;
    return average.toFixed(1);
  } catch (error) {
    console.error('Error fetching facility ratings:', error);
    throw error;
  }
};

export const editFacilityRating = async (
  facilityId: string,
  rating: number,
  comment: string,
) => {
  try {
    const userId = await AsyncStorage.getItem('user_id');
    const {data, error} = await supabase
      .from('facility_ratings')
      .upsert(
        {
          facility_id: facilityId,
          user_id: userId,
          rating: rating,
          comment: comment,
        },
        {onConflict: 'user_id,facility_id'},
      )
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating facility rating:', error);
    throw error;
  }
};

export const getFacilityRatingReview = async (facilityId: string) => {
  try {
    if (!facilityId) {
      throw new Error('Invalid facilityId: facilityId is undefined or null');
    }
    const {data, error} = await supabase
      .from('facility_ratings')
      .select(
        `
        rating,
        comment,
        created_at,
        user_profiles (id, first_name, last_name, avatar_url)
      `,
      )
      .eq('facility_id', facilityId)
      .order('created_at', {ascending: false}) // Latest records first
      .limit(5); // Get only the latest 5 records

    if (error) throw error;

    return data || []; // Return data or empty array if no data found
  } catch (error) {
    console.error('Error fetching facility ratings:', error);
    throw error;
  }
};
