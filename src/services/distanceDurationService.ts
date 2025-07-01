import axios from 'axios';
import {THIS_IS_MAP_KEY} from '../../config/variables';

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
 * @returns Array of distance and duration objects corresponding to each destination
 */
export const fetchDistancesAndDurations = async (
  originCoords: string | LatLng,
  destinationCoords: Array<string | LatLng>,
): Promise<DistanceDuration[]> => {
  try {
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

    const response = await axios.get<DistanceMatrixResponse>(url);
    const data = response.data;

    if (data?.status !== 'OK') {
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
    const results = await fetchDistancesAndDurations(origin, [destination]);
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
