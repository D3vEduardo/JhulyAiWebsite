import { getChatMessages } from "@components/AsideMenu/getChatMessages";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export function useChatMessages() {
  const { chatId } = useParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    const isExistingChat =
      chatId !== "new" && chatId !== "null" && chatId !== "undefined";
    if (!isExistingChat) return;
    console.log(`Invalidating chat ${chatId} messages`);
    queryClient.invalidateQueries({ queryKey: ["chat", `chat_${chatId}`] });
  }, [chatId, queryClient]);

  return useQuery({
    queryKey: ["chat", `chat_${chatId}`],
    queryFn: async () => {
      if (!chatId || typeof chatId !== "string") return [];
      const messages = await getChatMessages(chatId);
      console.log(`Chat ${chatId} messages:`, messages);
      return messages;
    },
    enabled: !!chatId,
  });
}
