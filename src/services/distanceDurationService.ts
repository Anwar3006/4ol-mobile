import axios from 'axios';
import {
  THIS_IS_MAP_KEY,
  SUPABASE_URL,
  SUPABASE_KEY,
} from '../../config/variables';

// Supabase Edge Function API guard
const checkApiAllowed = async (action: string) => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/api-guard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({action}),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.message);
  return true;
};

interface LatLng {
  lat: number;
  lng: number;
}

interface DistanceMatrixElement {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  status: string;
}

interface DistanceMatrixRow {
  elements: DistanceMatrixElement[];
}

interface DistanceMatrixResponse {
  destination_addresses: string[];
  origin_addresses: string[];
  rows: DistanceMatrixRow[];
  status: string;
}

export interface DistanceDuration {
  distance: string;
  distanceValue: number;
  duration: string;
  durationValue: number;
}

/**
 * Fetches distance and duration from a single origin to multiple destinations in one API call
 * @param originCoords Origin coordinates as "lat,lng" string or LatLng object
 * @param destinationCoords Array of destination coordinates as "lat,lng" strings or LatLng objects
 * @param isInternalCall Whether this is called internally by fetchDistanceAndDuration (to avoid double counting)
 * @returns Array of distance and duration objects corresponding to each destination
 */
export const fetchDistancesAndDurations = async (
  originCoords: string | LatLng,
  destinationCoords: Array<string | LatLng>,
  isInternalCall: boolean = false,
): Promise<DistanceDuration[]> => {
  try {
    // API call tracking removed - keeping Supabase API guard

    // Format origin string
    const origin =
      typeof originCoords === 'string'
        ? originCoords
        : `${originCoords.lat},${originCoords.lng}`;

    // Format destinations string with pipe separator
    const destinations = destinationCoords
      .map(dest =>
        typeof dest === 'string' ? dest : `${dest.lat},${dest.lng}`,
      )
      .join('|');
    console.log('Check me====>');

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin}&destinations=${destinations}&key=${THIS_IS_MAP_KEY}`;
    console.log(
      '📏 [DISTANCE MATRIX API] Making request to:',
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin}&destinations=${destinations}&key=${THIS_IS_MAP_KEY.substring(
        0,
        10,
      )}...`,
    );

    // Validate coordinates before making API call
    if (origin.includes('null') || destinations.includes('null')) {
      console.error('❌ Invalid coordinates detected:', {origin, destinations});
      return [];
    }

    // Check API guard first - use different action based on call type (even in test mode for testing)
    try {
      const action = isInternalCall
        ? 'SinglePlaceDistance'
        : 'MultiPlaceDistance';
      await checkApiAllowed(action);
    } catch (error) {
      console.log(
        '🚫 Distance Matrix API call blocked by Supabase guard:',
        (error as Error).message,
      );
      return [];
    }

    const response = await axios.get<DistanceMatrixResponse>(url);
    const data = response.data;
    console.log('📏 [DISTANCE MATRIX API] Response status:', data.status);
    if (data.status !== 'OK') {
      console.warn('📏 [DISTANCE MATRIX API] Error:', data.status);
    }

    if (data?.status === 'OK') {
      // Track Google API call only after successful response
      const functionName = isInternalCall
        ? 'fetchDistanceAndDuration'
        : 'fetchDistancesAndDurations';
      // API call tracking removed - keeping Supabase API guard
      const apiAllowed = true; // Simplified since we're not tracking anymore

      if (!apiAllowed) {
        console.log(
          '🚫 Distance Matrix API call blocked by persistent tracker',
        );
        return [];
      }
    } else {
      console.log('Distance Matrix API response error:', data.status);
      return [];
    }

    // Map results to a simpler format
    const results =
      data.rows[0]?.elements.map((element, index) => {
        if (element.status === 'OK') {
          return {
            distance: element.distance.text,
            distanceValue: element.distance.value, // Distance in meters
            duration: element.duration.text,
            durationValue: element.duration.value, // Duration in seconds
          };
        }
        console.log(`Error for destination ${index}:`, element.status);
        return {
          distance: '',
          distanceValue: 0,
          duration: '',
          durationValue: 0,
        };
      }) || [];

    return results;
  } catch (error) {
    console.error('Error fetching distances and durations:', error);
    return [];
  }
};

// Keep the original function for backward compatibility
export const fetchDistanceAndDuration = async (
  origin: string,
  destination: string,
): Promise<{distance: string; duration: string}> => {
  try {
    // Validate inputs before proceeding
    if (
      !origin ||
      !destination ||
      origin.includes('null') ||
      destination.includes('null')
    ) {
      console.error('❌ Invalid coordinates in fetchDistanceAndDuration:', {
        origin,
        destination,
      });
      return {distance: '', duration: ''};
    }

    // Note: checkApiAllowed is called in fetchDistancesAndDurations to avoid double counting

    // API call tracking removed - keeping Supabase API guard
    console.log('📞 fetchDistanceAndDuration called with:', {
      origin,
      destination,
    });

    const results = await fetchDistancesAndDurations(
      origin,
      [destination],
      true,
    ); // true = internal call
    const result = results[0] || {distance: '', duration: ''};
    return {
      distance: result.distance,
      duration: result.duration,
    };
  } catch (error) {
    console.error('Error in legacy fetchDistanceAndDuration:', error);
    return {
      distance: '',
      duration: '',
    };
  }
};
