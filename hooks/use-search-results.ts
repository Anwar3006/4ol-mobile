import { useInfiniteQuery } from "@tanstack/react-query";

// Types
type Facility = {
  id: string;
  name: string;
  type: string;
  address: string;
  rating: number;
  // Add your facility fields here
};

type FacilityResponse = {
  data: Facility[];
  nextPage: number | null;
  totalCount: number;
};

type SearchParams = {
  facilityType?: string;
  search?: string;
};

// API function - Replace with your actual API call
async function fetchFacilities(
  params: SearchParams,
  page: number
): Promise<FacilityResponse> {
  const { facilityType, search } = params;

  // Build query params
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: "20", // Items per page
    ...(facilityType && { type: facilityType }),
    ...(search && { q: search }),
  });

  // Replace with your actual API endpoint
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/facilities?${queryParams}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch facilities");
  }

  const data = await response.json();

  return {
    data: data.facilities,
    nextPage: data.hasMore ? page + 1 : null,
    totalCount: data.total,
  };
}

// Custom hook for infinite scroll
export function useSearchResults(params: SearchParams) {
  return useInfiniteQuery({
    queryKey: ["facilities", params],
    queryFn: ({ pageParam = 1 }) => fetchFacilities(params, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    enabled: !!(params.facilityType || params.search), // Only fetch if we have params
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
