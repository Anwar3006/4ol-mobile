import { supabase } from "@/lib/supabase";
import { MobileUserProfile } from "@/types";
import { TUserProfile } from "@4ol/db/schemas/user-profile.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native";

export const useUserProfile = (id: string) => {
  return useQuery<MobileUserProfile, Error>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*, user:user(email)")
        .eq("user_id", id)
        .single();
      if (error) throw error;
      return { ...data, ...data.user, user: null };
    },
    enabled: !!id,
  });
};

export const useCreateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<MobileUserProfile, Error, any>({
    mutationFn: async (data: MobileUserProfile) => {
      const { data: result, error } = await supabase
        .from("user_profiles")
        .insert({
          user_id: data.user_id,
          first_name: data.first_name,
          last_name: data.last_name,
          sex: data.sex,
          dob: data.dob,
          user_type: data.user_type,
          role: data.role,
          phone_number: data.phone_number,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-profile"],
      });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { section: "profile", action: "create_profile" },
      });
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<MobileUserProfile, Error, any>({
    mutationFn: async (data: any) => {
      console.log("UserToUpdate: ", data.user_id);
      const { data: result, error } = await supabase
        .from("user_profiles")
        .update({
          user_id: data.user_id,
          first_name: data.first_name,
          last_name: data.last_name,
          sex: (data.sex as string).toLocaleLowerCase(),
          dob: data.dob,
          user_type: data.user_type,
          role: data.role,
          phone_number: data.phone_number,
        })
        .select()
        .eq("user_id", data.user_id)
        .maybeSingle();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: Error) => {
      console.error("Error updating user profile:", error);
      Sentry.captureException(error, {
        tags: { section: "profile", action: "update_profile" },
      });
    },
  });
};
