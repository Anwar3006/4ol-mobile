import { supabase } from "@/lib/supabase";
import { useInfiniteQuery } from "@tanstack/react-query";

export type MarketingCampaign = {
  id: string;
  headline: string;
  description: string;
  organization: string;
  imageUrl: string | null;
  cta: string | null;
  links: string[];
  status: "draft" | "scheduled" | "live" | "paused" | "ended";
  createdAt: string;
};

export const useInfiniteLiveCampaigns = () => {
  return useInfiniteQuery({
    queryKey: ["live-campaigns"],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from("marketing_profile")
        .select("*")
        .eq("status", "live")
        .order("createdAt", { ascending: false })
        .range(pageParam, pageParam + 2); // Fetch 3 at a time

      if (error) throw error;
      return data as MarketingCampaign[];
    },
    getNextPageParam: (lastPage: MarketingCampaign[], allPages: MarketingCampaign[][]) => {
      if (lastPage.length < 3) return undefined;
      return allPages.length * 3;
    },
    initialPageParam: 0,
  });
};
