import { honoRPC } from "@/lib/hono/rpc";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, usePathname } from "next/navigation";
import { useEffect } from "react";

export function useChatMessages({
  externalChatId,
}: {
  externalChatId?: string | null;
} = {}) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const chatId = pathname.includes("/chat/")
    ? (pathname.split("/").pop() ?? null)
    : null;

  console.debug(
    "[src/hooks/useChatMessages.ts:useChatMessages] ChatID:",
    chatId
  );

  return useQuery({
    queryKey: ["chat", `chat_${chatId}`],
    queryFn: async () => {
      if (!chatId || typeof chatId !== "string" || chatId === "new") return [];
      console.debug(
        "[src/hooks/useChatMessages.ts:useChatMessages] Fetching chat messages for chat ID:",
        chatId
      );
      const apiResponse = await honoRPC.api.users.me.chats[
        ":chatId"
      ].messages.$get({
        param: {
          chatId,
        },
      });

      if (!apiResponse.ok) {
        const body = await apiResponse.json();
        console.debug(
          "[src/hooks/useChatMessages.ts:useChatMessages]",
          `Error fetching chat ${chatId} messages:`,
          apiResponse.status,
          apiResponse.statusText,
          body.message
        );
        return [];
      }

      const body = await apiResponse.json();
      console.debug(
        "[src/hooks/useChatMessages.ts:useChatMessages] Fetched chat messages for chat ID:",
        chatId,
        body
      );
      const messages = body.data;
      console.debug(
        `[src/hooks/useChatMessages.ts:useChatMessages]: Chat ${chatId} messages:`,
        messages
      );
      return messages;
    },
    enabled: !!chatId,
  });
}
