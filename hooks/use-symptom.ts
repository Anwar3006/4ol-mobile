import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export type SymptomFilter = {
  searchTerm?: string;
  letter?: string;
  categoryId?: string;
};

export const useSymptoms = (filter: SymptomFilter) => {
  return useQuery({
    queryKey: ["symptoms", filter],
    queryFn: async () => {
      let query = supabase.from("symptoms").select("*");

      if (filter.letter) {
        query = query.ilike("symptom_name", `${filter.letter}%`);
      }
      if (filter.searchTerm) {
        query = query.or(
          `symptom_name.ilike.%${filter.searchTerm}%,about.ilike.%${filter.searchTerm}%`
        );
      }
      if (filter.categoryId) {
        query = query.eq("category_id", filter.categoryId);
      }

      const { data, error } = await query.order("symptom_name", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!(filter.searchTerm || filter.letter || filter.categoryId),
  });
};

export const useSymptom = ({ id, enabled }: { id: string; enabled: boolean }) => {
  return useQuery({
    queryKey: ["symptom", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("symptoms")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled,
  });
};
