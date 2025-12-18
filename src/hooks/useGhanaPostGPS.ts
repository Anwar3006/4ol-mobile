import {useState} from 'react';

export default function useGhanaPostGPS() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressData, setAddressData] = useState(null);
  const [locationData, setLocationData] = useState(null);

  const fetchGhanaPostAddress = async (latitude: any, longitude: any) => {
    setLoading(true);
    setError(null);

    try {
      // Create FormData object (the API expects form data, not JSON)
      const formData = new FormData();
      formData.append('lat', latitude.toString());
      formData.append('long', longitude.toString());

      // Make the request to the Ghana Post GPS API
      const response = await fetch(
        'https://ghanapostgps.sperixlabs.org/get-address',
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Check if the API returned an error
      if (data.error) {
        throw new Error(data.error);
      }

      setAddressData(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Ghana Post GPS data');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationByGPSAddress = async (gpsAddress: string) => {
    if (!gpsAddress || gpsAddress.trim() === '') {
      setError('GPS address is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('address', gpsAddress.trim());

      const response = await fetch(
        'https://ghanapostgps.sperixlabs.org/get-location',
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setLocationData(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Ghana Post GPS location');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchGhanaPostAddress,
    fetchLocationByGPSAddress,
    addressData,
    loading,
    error,
  };
}
