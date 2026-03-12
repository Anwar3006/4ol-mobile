import { supabase } from "@/lib/supabase";
import {
  TFacilityProfileInput,
  TFacilityProfileOutput,
} from "@/schemas/facility-profile.schema";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useFavoritesStore from "@/store/use-favorites-store";
import * as Sentry from "@sentry/react-native";

interface PaginatedResponse {
  data: TFacilityProfileInput[];
  meta: {
    total: number;
    totalPages: number;
    currentPage: number;
  };
  analytics: {
    active: number;
    inactive: number;
    pending: number;
    rejected: number;
  };
}

type Pagination = {
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
  type?: string;
};

export const FACILITY_PROFILE_QUERY_KEYS = {
  all: ["facilities"] as const,
  map: ["map"] as const,
  lists: () => [...FACILITY_PROFILE_QUERY_KEYS.all, "lists"] as const,
  list: (params: Pagination) =>
    [...FACILITY_PROFILE_QUERY_KEYS.lists(), { ...params }] as const,
  details: () => [...FACILITY_PROFILE_QUERY_KEYS.all, "details"] as const,
  detail: (id: string) =>
    [...FACILITY_PROFILE_QUERY_KEYS.details(), id] as const,
};

export const useFacilityProfiles = (filters: Omit<Pagination, "page">) => {
  // console.log("Filters: ", filters);
  return useInfiniteQuery({
    // We only put filters in the key, NOT the page.
    // This ensures that when we fetch page 2, we don't clear page 1.
    queryKey: FACILITY_PROFILE_QUERY_KEYS.list(filters),

    queryFn: async ({ pageParam = 1 }) => {
      const limit = filters.limit || 10;
      const from = (pageParam - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("facility_profile")
        .select("*", { count: "exact" })
        .eq("status", "active");

      // Apply Filters
      if (filters.search) {
        // Add ::text to any column that is an Enum or not a standard string
        query.or(
          `facility_name.ilike.%${filters.search}%,area.ilike.%${filters.search}%`,
        );
      }

      if (filters.type) {
       if (filters.type === 'wellness') {
          query.ilike('facility_type', 'wellness%'); 
        } else {
          query.eq('facility_type', filters.type);
        }
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        facilities: data,
        currentPage: pageParam,
        totalCount,
        totalPages,
      };
    },

    // Logic to determine if there is another page to fetch
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },

    initialPageParam: 1,
    // Keep data on screen while fetching next page for "Zero-Flicker"
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFacilityProfile = ({
  id,
  enabled,
}: {
  id: string;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: FACILITY_PROFILE_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const result = await supabase
        .from("facility_profile")
        .select("*")
        .eq("id", id);
      if (result.error) throw result.error;
      return result.data[0] as TFacilityProfileOutput;
    },
    enabled: enabled,
  });
};

export const useGetFacilitiesMapData = ({
  minLng,
  minLat,
  maxLng,
  maxLat,
  zoom,
  enabled,
  filters = {},
}: {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
  zoom: number;
  enabled: boolean;
  filters?: {
    facilityName?: string;
    region?: string;
    district?: string;
    facilityType?: string;
    status?: string;
  };
}) => {
  console.log("Filters: ", filters);
  return useQuery<any, Error>({
    queryKey: [
      FACILITY_PROFILE_QUERY_KEYS.map,
      minLng,
      minLat,
      maxLng,
      maxLat,
      Math.round(zoom),
      filters,
    ],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_facilities_map", {
        minlng: minLng,
        minlat: minLat,
        maxlng: maxLng,
        maxlat: maxLat,
        zoom_level: Math.round(zoom),
        // Match the web hook — these unlock the full result set from the RPC
        p_facility_name: filters.facilityName || null,
        p_region:        filters.region       || null,
        p_district:      filters.district     || null,
        p_facility_type: filters.facilityType || null,
        p_status:        filters.status       || "active",
      });

      if (error) throw error;

      // Normalize features: map 'type' property to 'facility_type' if needed
      // and ensure 'id' is present. The RPC returns 'type' but mobile expects 'facility_type'
      if (data?.features) {
        data.features = data.features.map((f: any) => ({
          ...f,
          properties: {
            ...f.properties,
            facility_type: f.properties.type || f.properties.facility_type,
          },
        }));
      }

      return data; // GeoJSON FeatureCollection
    },
    enabled: enabled,
    placeholderData: (prev: any) => prev,
    staleTime: 1000 * 60, //Every 1 min
  });
};

export const useTopRatedFacilities = (filters: Omit<Pagination, "page">) => {
  return useInfiniteQuery({
    queryKey: [...FACILITY_PROFILE_QUERY_KEYS.all, "top-rated", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const limit = filters.limit || 10;
      const from = (pageParam - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("facility_profile")
        .select("*", { count: "exact" })
        .eq("status", "active")
        .eq("is_top_rated", true);

      const { data, error, count } = await query
        .order("avg_rating", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        facilities: data,
        currentPage: pageParam,
        totalCount,
        totalPages,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

export const useUserFacilities = (userId: string | undefined) => {
  return useQuery({
    queryKey: [...FACILITY_PROFILE_QUERY_KEYS.all, "user-owned", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("facility_profile")
        .select("*")
        .eq("ownerId", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TFacilityProfileOutput[];
    },
    enabled: !!userId,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const { addFavorite, removeFavorite } = useFavoritesStore();

  return useMutation({
    // ─────────────────────────────────────────────────────────────────────
    // IMPORTANT: `wasAlreadyFavorite` must be computed by the caller BEFORE
    // calling mutate(), and passed as a variable here.
    //
    // Why: TanStack Query calls onMutate first (optimistic update), which
    // flips the Zustand store. mutationFn runs AFTER onMutate, so calling
    // isFavorite() inside mutationFn would read the already-flipped state
    // and perform the WRONG database operation (DELETE instead of INSERT
    // and vice-versa), causing favorites to be cleared from the DB.
    // ─────────────────────────────────────────────────────────────────────
    mutationFn: async ({
      userId,
      facility,
      wasAlreadyFavorite,
    }: {
      userId: string;
      facility: TFacilityProfileOutput;
      wasAlreadyFavorite: boolean;
    }) => {
      if (wasAlreadyFavorite) {
        const { error } = await supabase
          .from("facility_favorites")
          .delete()
          .eq("user_id", userId)
          .eq("facility_id", facility.id);

        if (error) throw error;
        return { action: "removed", facilityId: facility.id };
      } else {
        const { error } = await supabase.from("facility_favorites").insert({
          user_id: userId,
          facility_id: facility.id,
        });

        if (error) throw error;
        return { action: "added", facility };
      }
    },
    onMutate: async ({ facility, wasAlreadyFavorite }) => {
      // Optimistic local update — use the pre-toggle snapshot so the
      // UI flips instantly without waiting for the network.
      if (wasAlreadyFavorite) {
        removeFavorite(facility.id);
      } else {
        addFavorite(facility);
      }
      // Return context so onError can roll back correctly
      return { wasAlreadyFavorite, facility };
    },
    onError: (err, _vars, context) => {
      // Roll back the optimistic update using the saved context
      if (context) {
        if (context.wasAlreadyFavorite) {
          // We optimistically removed it — restore it
          addFavorite(context.facility);
        } else {
          // We optimistically added it — remove it
          removeFavorite(context.facility.id);
        }
      }
      console.error("Error toggling favorite:", err);
      Sentry.captureException(err, {
        tags: { section: "facilities", action: "toggle_favorite" },
        extra: { facilityId: _vars.facility.id },
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};

export const useSyncFavorites = (userId: string | undefined) => {
  const { setFavorites } = useFavoritesStore();

  return useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("facility_favorites")
        .select("facility_id, facility_profile(*)")
        .eq("user_id", userId);

      if (error) throw error;
      const favorites = data.map((item: any) => item.facility_profile);
      setFavorites(favorites);
      return favorites;
    },
    enabled: !!userId,
  });
};
