import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native";

type Pagination = {
  limit: number;
  page: number;
  search?: string;
};

export const useMedicationReminders = ({
  limit,
  page,
  userId,
  status,
}: Pagination & { userId: string; status: boolean }) => {
  return useQuery({
    queryKey: ["medication-reminders", userId, status, page],
    queryFn: async () => {
      let query = supabase
        .from("medication_reminders")
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

export const useMedicationReminder = (reminderId: string) => {
  return useQuery({
    queryKey: ["medication-reminder", reminderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medication_reminders")
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

// 1. Hook to Upsert (Create or Update)
export const useUpsertMedication = () => {
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
        drug_name: string;
        generic_name?: string;
        rxcui?: string;
        dosage_amount: string;
        interval: string;
        interval_units: string;
        start_date?: string;
        end_date?: string;
        purpose?: string[];
        instructions?: string;
        side_effects?: string;
        raw_openfda_data?: any;
        is_active?: boolean;
        is_enabled?: boolean;
      };
    }) => {
      const { data, error } = await supabase.rpc(
        "admin_upsert_medication_reminder",
        {
          p_user_id: userId,
          p_reminder_id: reminderId,
          p_payload: values,
        },
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medication-reminders"] });
    },
    onError: (error: any) => {
      console.error(`Mutation Error: ${error.message}`);
      Sentry.captureException(error, {
        tags: { section: "medications", action: "upsert_medication" },
      });
    },
  });
};

// 1b. Hook to Delete a Medication Reminder
export const useDeleteMedication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from("medication_reminders")
        .delete()
        .eq("id", reminderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medication-reminders"] });
      queryClient.invalidateQueries({ queryKey: ["medication-reminder"] });
    },
    onError: (error: any) => {
      console.error(`Delete Error: ${error.message}`);
      Sentry.captureException(error, {
        tags: { section: "medications", action: "delete_medication" },
      });
    },
  });
};

// 2. Hook to fetch Drug for AutoComplete from RxNorm
export const useGetRxNorm = (query: string) => {
  return useQuery({
    queryKey: ["drug-search", query],
    queryFn: async () => {
      if (query.length < 3) return [];
      // Calling RxNav API for autocomplete
      const response = await fetch(
        `https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${query}`,
      );
      const data = await response.json();
      return data.suggestionGroup.suggestionList.suggestion || [];
    },
    enabled: query.length > 2,
  });
};

// 3. Hook to fetch Medication Data from OpenFDA
export const useOpenFDAMedicationData = (drugName: string) => {
  return useQuery({
    queryKey: ["openfda-medication", drugName],
    queryFn: async () => {
      if (drugName.length < 3) return null;

      const encoded = encodeURIComponent(drugName);
      // Broader search: try brand_name OR generic_name for better coverage
      const url = `https://api.fda.gov/drug/label.json?search=(openfda.brand_name:"${encoded}"+OR+openfda.generic_name:"${encoded}")&limit=1`;

      const response = await fetch(url);

      if (!response.ok) {
        // Fallback: try a plain text search
        const fallbackUrl = `https://api.fda.gov/drug/label.json?search=${encoded}&limit=1`;
        const fallbackResponse = await fetch(fallbackUrl);
        if (!fallbackResponse.ok) return null;
        const fallbackData = await fallbackResponse.json();
        return fallbackData.results ? fallbackData.results[0] : null;
      }

      const data = await response.json();
      return data.results ? data.results[0] : null;
    },
    enabled: drugName.length > 2,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
