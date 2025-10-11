import { honoRPC } from "@/lib/hono/rpc";
import { useInfiniteQuery } from "@tanstack/react-query";

interface ChatResponse {
  message: string;
  data: {
    id: string;
    name: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
  }[];
  pagination: {
    nextCursor: string | null;
    hasNextPage: boolean;
    limit: number;
  };
}

export function useInfiniteUserChats() {
  return useInfiniteQuery({
    queryKey: ["infinite-user-chats"],
    queryFn: async ({ pageParam }) => {
      const apiResponse = await honoRPC.api.users.me.chats.$get({
        query: {
          cursor: pageParam || undefined,
          limit: "20",
        },
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.debug("[src/hooks/useInfiniteUserChats.ts:useInfiniteUserChats]", "Error fetching user chats:", apiResponse.status, apiResponse.statusText, errorText);
        throw new Error(`Failed to fetch chats: ${apiResponse.status} ${apiResponse.statusText}`);
      }

      const response: ChatResponse = await apiResponse.json();
      const { data, pagination } = response;
      
      return {
        data,
        nextCursor: pagination.nextCursor,
      };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
  });
}