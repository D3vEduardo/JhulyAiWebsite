import { honoRPC } from "@/lib/hono/rpc";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

interface MessageResponse {
  message: string;
  data: any[];
  pagination: {
    nextCursor: string | null;
    hasNextPage: boolean;
    limit: number;
  };
}

export function useInfiniteChatMessages(externalChatId?: string) {
  const { chatId: chatIdFromParams } = useParams();
  const chatId = externalChatId || chatIdFromParams;

  const isExistingChat = chatId && chatId !== "new" && chatId !== "null" && chatId !== "undefined";

  return useInfiniteQuery({
    queryKey: ["infinite-chat-messages", chatId],
    queryFn: async ({ pageParam }) => {
      if (!chatId || typeof chatId !== "string" || chatId === "new") return { data: [], nextCursor: null };
      
      const apiResponse = await honoRPC.api.users.me.chats[":chatId"].messages.$get({
        param: { chatId },
        query: {
          cursor: pageParam || undefined,
          limit: "20",
        },
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.debug(`[src/hooks/useInfiniteChatMessages.ts:useInfiniteChatMessages] Error fetching chat ${chatId} messages:`, apiResponse.status, apiResponse.statusText, errorText);
        throw new Error(`Failed to fetch messages: ${apiResponse.status} ${apiResponse.statusText}`);
      }

      const response: MessageResponse = await apiResponse.json();
      const { data, pagination } = response;
      
      return {
        data,
        nextCursor: pagination.nextCursor,
      };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!isExistingChat,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
  });
}