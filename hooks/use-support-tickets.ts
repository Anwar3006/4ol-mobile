import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface SupportTicketInput {
  subject: string;
  message: string;
  requested_by: string;
  user_name: string;
  priority?: "Low" | "Medium" | "High";
  status?: "Open" | "Closed";
}

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SupportTicketInput) => {
      const { data: result, error } = await supabase
        .from("chat_support")
        .insert({
          subject: data.subject,
          message: data.message,
          requested_by: data.requested_by,
          user_name: data.user_name,
          priority: data.priority || "Low",
          status: data.status || "Open",
          is_deleted: false,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ["chats"] }); // placeholder
    },
  });
};
