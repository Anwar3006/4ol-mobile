import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useConditionCategories = () => {
  return useQuery({
    queryKey: ["condition-category"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      // 1. Create a Map for O(1) lookups during nesting
      const categoryMap: Record<string, any> = {};
      data.forEach((item) => {
        categoryMap[item.id] = { ...item, children: [] };
      });

      // 2. Build the tree
      const rootCategories: any[] = [];
      data.forEach((item) => {
        const node = categoryMap[item.id];
        if (item.parent_id === null) {
          rootCategories.push(node);
        } else {
          const parent = categoryMap[item.parent_id];
          if (parent) {
            parent.children.push(node);
          } else {
            // Fallback: If parent not found, treat as root to avoid orphan
            rootCategories.push(node);
          }
        }
      });

      return rootCategories;
    },
    // Since categories rarely change, set high staleTime/gcTime
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  });
};
