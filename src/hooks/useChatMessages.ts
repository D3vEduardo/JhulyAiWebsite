import { getChatMessages } from "@/components/csr/MessagesContainer/getChatMessages";
import { ConvertMessageOfDatabaseToAiModel } from "@/utils/convertMessageOfDbToAiModel";
import { useQuery } from "@tanstack/react-query";

export function useChatMessages(chatId: string | null) {
  return useQuery({
    queryKey: ["chat", `chat_${chatId}`],
    queryFn: async () => {
      if (!chatId) return [];
      const messages = await getChatMessages(chatId);
      return ConvertMessageOfDatabaseToAiModel(messages);
    },
    enabled: !!chatId,
    staleTime: Infinity,
  });
}
