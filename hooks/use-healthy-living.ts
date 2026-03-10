import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export type HealthyLivingFilter = {
  category?: string;
  searchTerm?: string;
};

/** Fetch all distinct categories from the healthy_living table */
export const useHealthyLivingCategories = () => {
  return useQuery({
    queryKey: ["healthy-living-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("healthy_living")
        .select("category")
        .not("category", "is", null)
        .order("category", { ascending: true });

      if (error) throw error;

      // Deduplicate categories
      const seen = new Set<string>();
      const unique: string[] = [];
      data.forEach((row: any) => {
        const cat = row.category?.trim();
        if (cat && !seen.has(cat)) {
          seen.add(cat);
          unique.push(cat);
        }
      });
      return unique;
    },
    staleTime: 1000 * 60 * 30,
  });
};

/** Fetch healthy living topics, optionally filtered */
export const useHealthyLivingTopics = (filter: HealthyLivingFilter) => {
  return useQuery({
    queryKey: ["healthy-living-topics", filter],
    queryFn: async () => {
      let query = supabase.from("healthy_living").select("*");

      if (filter.category) {
        query = query.ilike("category", filter.category);
      }
      if (filter.searchTerm) {
        query = query.or(
          `topic_name.ilike.%${filter.searchTerm}%,about.ilike.%${filter.searchTerm}%`
        );
      }

      const { data, error } = await query
        .order("topic_name", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!(filter.category || filter.searchTerm),
  });
};

/** Fetch a single healthy living topic by id */
export const useHealthyLivingTopic = ({
  id,
  enabled,
}: {
  id: string;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ["healthy-living-topic", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("healthy_living")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled,
  });
};
