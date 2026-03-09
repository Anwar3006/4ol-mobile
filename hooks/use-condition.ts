import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import {
  TConditionsOutput,
} from "@4ol/db/schemas/conditions.schema";

export type ConditionFilter = {
  categoryId?: string;
  letter?: string;
  searchTerm?: string;
};

interface Pagination {
  limit: number;
  page: number;
  search: string;
}

export const CONDITIONS_QUERY_KEYS = {
  all: ["conditions"] as const,
  lists: () => [...CONDITIONS_QUERY_KEYS.all, "lists"] as const,
  list: (params: Pagination) =>
    [...CONDITIONS_QUERY_KEYS.lists(), { ...params }] as const,
  details: () => [...CONDITIONS_QUERY_KEYS.all, "details"] as const,
  detail: (id: string) => [...CONDITIONS_QUERY_KEYS.details(), id] as const,
};

export const useConditions = (filter: ConditionFilter) => {
  return useQuery({
    // The queryKey becomes a dependency array for your filters
    queryKey: ["conditions", filter],
    queryFn: async () => {
      const { categoryId, letter, searchTerm } = filter;

      // Start the query builder
      let query = supabase.from("conditions").select("*");

      // 1. Handle Many-to-Many Category Filter
      if (categoryId) {
        const { data, error } = await supabase
          .from("condition_categories")
          .select("conditions(*)")
          .eq("category_id", categoryId)
          .order("conditions(name)", { ascending: true });

        if (error) throw error;
        return data.map((item) => item.conditions).filter(Boolean);
      }

      // 2. Handle Alphabet Filter (Starts With)
      if (letter) {
        query = query.ilike("name", `${letter}%`);
      }

      // 3. Handle Global Search Filter
      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`,
        );
      }

      const { data, error } = await query.order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
    // Only run if at least one filter is active
    enabled: !!(filter.categoryId || filter.letter || filter.searchTerm),
  });
};

export const useCondition = ({
  id,
  enabled,
}: {
  id: string;
  enabled: boolean;
}) => {
  return useQuery<TConditionsOutput, Error>({
    queryKey: CONDITIONS_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conditions")
        .select(
          `
          *,
          condition_types (type_name, about_type),
          condition_causes (cause_name, other_possible_causes),
          condition_body_parts (
            body_parts (id, name, mesh_id)
          ),
          condition_categories (
            categories (id, name, path)
          )
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);

      // Note: Data will come back with nested arrays like condition_body_parts[0].body_parts
      const {
        condition_body_parts,
        condition_categories,
        condition_causes,
        condition_types,
        ...rest
      } = data;
      return {
        ...rest,
        causes: condition_causes,
        bodyParts: condition_body_parts,
        categories: condition_categories,
        types: condition_types,
      } as unknown as TConditionsOutput;
    },
    enabled: enabled,
  });
};