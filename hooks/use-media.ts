import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import * as Constant from "expo-constants";

export const useGetMediaPublicUrl = (paths: string[]) => {
  const bucketName = Constant.default.expoConfig?.extra?.SUPABASE_BUCKET_NAME;
  return useQuery({
    queryKey: ["public-url", paths],
    queryFn: async () => {
      if (!paths || paths.length === 0) return [];

      return paths.map((path) => {
        const { data } = supabase.storage
          .from(bucketName as string)
          .getPublicUrl(path);
        return data.publicUrl;
      });
    },
    enabled: paths?.length > 0,
  });
};
