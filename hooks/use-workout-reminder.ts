import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native";

type Pagination = {
  limit: number;
  page: number;
  search?: string;
};

export const useWorkoutReminders = ({
  limit,
  page,
  userId,
  status,
}: Pagination & { userId: string; status: boolean }) => {
  return useQuery({
    queryKey: ["workout-reminders", userId, status, page],
    queryFn: async () => {
      let query = supabase
        .from("workout_reminders")
        .select("*")
        .eq("user_id", userId)
        // Filter based on the tab
        .eq("is_active", status);

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useWorkoutReminder = (reminderId: string) => {
  return useQuery({
    queryKey: ["workout-reminder", reminderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_reminders")
        .select("*")
        .eq("id", reminderId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!reminderId,
  });
};

// ===================== Mutations

// Hook to Upsert (Create or Update)
export const useUpsertWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      reminderId,
      values,
    }: {
      userId: string;
      reminderId: string | null;
      values: {
        workout_type: string;
        duration: string;
        time: string;
        days: string[];
        goals?: string;
        is_active?: boolean;
        is_enabled?: boolean;
      };
    }) => {
      // If we have an ID, update, otherwise insert
      let result;
      if (reminderId) {
        result = await supabase
          .from("workout_reminders")
          .update(values)
          .eq("id", reminderId)
          .eq("user_id", userId); // Ensure security
      } else {
        result = await supabase
          .from("workout_reminders")
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
      queryClient.invalidateQueries({ queryKey: ["workout-reminders"] });
    },
    onError: (error: any) => {
      console.error(`Mutation Error: ${error.message}`);
      Sentry.captureException(error, {
        tags: { section: "workouts", action: "upsert_workout" },
      });
    },
  });
};

// Hook to Delete a Workout Reminder
export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from("workout_reminders")
        .delete()
        .eq("id", reminderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-reminders"] });
      queryClient.invalidateQueries({ queryKey: ["workout-reminder"] });
    },
    onError: (error: any) => {
      console.error(`Delete Error: ${error.message}`);
      Sentry.captureException(error, {
        tags: { section: "workouts", action: "delete_workout" },
      });
    },
  });
};
