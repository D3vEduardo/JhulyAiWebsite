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

  // This hook fetches all messages at once for backward compatibility
  // Use useInfiniteChatMessages for pagination/infinite scroll
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

      if (!apiResponse.ok) {
        // Try to read body for better diagnostics
        let bodyText = "";
        try {
          bodyText = await apiResponse.text();
        } catch (e) {
          bodyText = `<unable to read body: ${String(e)}>`;
        }
        console.debug(
          "[src/hooks/useChatMessages.ts:useChatMessages]",
          `Error fetching chat ${chatId} messages:`,
          apiResponse.status,
          apiResponse.statusText,
          bodyText
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
