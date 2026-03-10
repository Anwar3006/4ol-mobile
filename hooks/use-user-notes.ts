import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native";

export const useUserNotes = (userId: string) => {
  return useQuery({
    queryKey: ["user-notes", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_notes")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useUpsertUserNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      noteId,
      values,
    }: {
      userId: string;
      noteId: string | null;
      values: {
        note: string;
        emotion: string;
        timestamp: string;
        medication_id?: string;
        workout_id?: string;
      };
    }) => {
      let result;
      if (noteId) {
        result = await supabase
          .from("user_notes")
          .update(values)
          .eq("id", noteId)
          .eq("user_id", userId);
      } else {
        result = await supabase
          .from("user_notes")
          .insert({
            ...values,
            user_id: userId,
          });
      }

      const { data, error } = result;

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notes"] });
    },
    onError: (error: any) => {
      console.error(`Mutation Error: ${error.message}`);
      Sentry.captureException(error, {
        tags: { section: "notes", action: "upsert_note" },
      });
    },
  });
};

export const useDeleteUserNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("user_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notes"] });
    },
    onError: (error: any) => {
      console.error(`Delete Error: ${error.message}`);
      Sentry.captureException(error, {
        tags: { section: "notes", action: "delete_note" },
      });
    },
  });
};
