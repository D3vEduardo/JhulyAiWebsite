import { honoRPC } from "@/lib/hono/rpc";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export function useChatMessages({
  externalChatId,
}: {
  externalChatId?: string;
} = {}) {
  const { chatId: chatIdOfParams } = useParams();
  const queryClient = useQueryClient();
  const chatId = externalChatId || chatIdOfParams || "new";

  useEffect(() => {
    const isExistingChat =
      chatId !== "new" && chatId !== "null" && chatId !== "undefined";
    if (!isExistingChat) return;
    console.debug(
      `[src/hooks/useChatMessages.ts:useChatMessages] Invalidating chat ${chatId} messages`
    );
    queryClient.invalidateQueries({ queryKey: ["chat", `chat_${chatId}`] });
  }, [chatId, queryClient]);

  return useQuery({
    queryKey: ["chat", `chat_${chatId}`],
    queryFn: async () => {
      if (!chatId || typeof chatId !== "string" || chatId === "new") return [];

      const apiResponse = await honoRPC.api.users.me.chats[
        ":chatId"
      ].messages.$get({
        param: {
          chatId,
        },
      });

      const body = await apiResponse.json();

      if (!apiResponse.ok) {
        console.debug(
          "[src/hooks/useChatMessages.ts:useChatMessages]",
          `Error fetching chat ${chatId} messages:`,
          apiResponse.status,
          apiResponse.statusText,
          body.message
        );
        return [];
      }

      const apiResponseData = await apiResponse.json();
      const messages = apiResponseData.data;
      console.debug(
        `[src/hooks/useChatMessages.ts:useChatMessages]: Chat ${chatId} messages:`,
        messages
      );
      return messages;
    },
    enabled: !!chatId,
  });
}
