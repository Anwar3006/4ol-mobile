import { useState } from "react";

export interface GhanaPostData {
  data: {
    address: string;
    location: {
      lat: number;
      long: number;
    };
    table: {
      area: string;
      district: string;
      region: string;
      street: string;
      postcode: string;
    };
  };
  error?: string;
}

export default function useGhanaPostGPS() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressData, setAddressData] = useState<GhanaPostData | null>(null);
  const [locationData, setLocationData] = useState<any>(null);

  const fetchGhanaPostAddress = async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("lat", latitude.toString());
      formData.append("long", longitude.toString());

      const response = await fetch(
        "https://ghanapostgps.sperixlabs.org/get-address",
        {
          method: "POST",
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

      setAddressData(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Failed to fetch Ghana Post GPS data");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationByGPSAddress = async (gpsAddress: string) => {
    if (!gpsAddress || gpsAddress.trim() === "") {
      setError("GPS address is required");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("address", gpsAddress.trim());

      const response = await fetch(
        "https://ghanapostgps.sperixlabs.org/get-location",
        {
          method: "POST",
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
      setError(err.message || "Failed to fetch Ghana Post GPS location");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchGhanaPostAddress,
    fetchLocationByGPSAddress,
    addressData,
    locationData,
    loading,
    error,
  };
}
