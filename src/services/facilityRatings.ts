import {supabase} from '../utils/supabaseClient';

export interface FacilityRating {
  id?: string;
  user_id: string;
  facility_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
}

export interface FacilityRatingResponse {
  success: boolean;
  data?: FacilityRating;
  error?: string;
}

/**
 * Save or update a facility rating (upsert - insert or update)
 */
export const saveFacilityRating = async (
  userId: string,
  facilityId: string,
  rating: number,
  comment: string = '',
): Promise<FacilityRatingResponse> => {
  try {
    const ratingData = {
      user_id: userId,
      facility_id: facilityId,
      rating: rating,
      comment: comment.trim() || null, // Store null if comment is empty
      created_at: new Date().toISOString(), // Use created_at for timestamp
    };

    console.log('Upserting facility rating with data:', ratingData);

    // Use upsert (insert or update) - this will insert if new, update if exists
    const {data, error} = await supabase
      .from('facility_ratings')
      .upsert([ratingData], {
        onConflict: 'user_id,facility_id', // Conflict on user_id and facility_id combination
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting facility rating:', error);
      return {
        success: false,
        error: error.message || 'Failed to save rating',
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Unexpected error upserting facility rating:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while saving the rating',
    };
  }
};

/**
 * Update an existing facility rating
 */
export const updateFacilityRating = async (
  ratingId: string,
  rating: number,
  comment: string = '',
): Promise<FacilityRatingResponse> => {
  try {
    const updateData = {
      rating: rating,
      comment: comment.trim() || null,
      created_at: new Date().toISOString(),
    };

    const {data, error} = await supabase
      .from('facility_ratings')
      .update(updateData)
      .eq('id', ratingId)
      .select()
      .single();

    if (error) {
      console.error('Error updating facility rating:', error);
      return {
        success: false,
        error: error.message || 'Failed to update rating',
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Unexpected error updating facility rating:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating the rating',
    };
  }
};

/**
 * Get user's existing rating for a specific facility
 */
export const getUserFacilityRating = async (
  userId: string,
  facilityId: string,
): Promise<FacilityRating | null> => {
  try {
    const {data, error} = await supabase
      .from('facility_ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('facility_id', facilityId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rating found for this user and facility
        return null;
      }
      console.error('Error fetching user facility rating:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching user facility rating:', error);
    return null;
  }
};

/**
 * Get all ratings for a specific facility
 */
export const getFacilityRatings = async (
  facilityId: string,
): Promise<FacilityRating[]> => {
  try {
    const {data, error} = await supabase
      .from('facility_ratings')
      .select('*')
      .eq('facility_id', facilityId)
      .order('created_at', {ascending: false});

    if (error) {
      console.error('Error fetching facility ratings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching facility ratings:', error);
    return [];
  }
};

/**
 * Calculate average rating for a facility
 */
export const getFacilityAverageRating = async (
  facilityId: string,
): Promise<{average: number; count: number}> => {
  try {
    const {data, error} = await supabase
      .from('facility_ratings')
      .select('rating')
      .eq('facility_id', facilityId);

    if (error) {
      console.error('Error fetching facility ratings for average:', error);
      return {average: 0, count: 0};
    }

    if (!data || data.length === 0) {
      return {average: 0, count: 0};
    }

    const ratings = data.map(item => Number(item.rating));
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    const average = Number((sum / ratings.length).toFixed(1));

    return {
      average,
      count: ratings.length,
    };
  } catch (error) {
    console.error(
      'Unexpected error calculating facility average rating:',
      error,
    );
    return {average: 0, count: 0};
  }
};
