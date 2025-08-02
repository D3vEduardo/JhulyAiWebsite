"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../Button";
import { getUserChats } from "./getUserChats";
import { useParams, useRouter } from "next/navigation";
import { getChatMessages } from "./getChatMessages";
import { useWindowSize } from "@hooks/useWindowSize";
import { DESKTOP_BREAKPOINT, useAside } from "@store/asideMenu";

export default function AsideMenuChats() {
  const widthOfScreen = useWindowSize();
  const { asideIsOpen, toggleAside } = useAside();
  console.log("Renderizei AsideMenuChats");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { chatId } = useParams();
  console.log("DEBUG - Current chatId in Aside:", chatId);
  const { data: chats, isPending: getChatsIsPending } = useQuery<
    {
      id: string;
      name: string;
      ownerId: string;
    }[]
  >({
    queryKey: ["chats"],
    queryFn: async () => {
      console.log("Getting user chats...");
      const userChats: {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
      }[] = await getUserChats();
      console.log("Get user chats is completed!");
      return userChats || [];
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Prefetch chat messages on hover
  const prefetchMessages = (chatId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["chat", `chat_${chatId}`],
      queryFn: async () => {
        console.log(`Fazendo prefetch de mensagens do chat '${chatId}'...`);
        const data = await getChatMessages(chatId);
        console.log(`Prefetch do chat '${chatId}' concluído!`);
        return data;
      },
      staleTime: 1000 * 60 * 1.5,
    });
  };

  return (
    <div className="mb-4 mt-2 overflow-y-auto gap-y-2 flex flex-col">
      {!getChatsIsPending ? (
        <>
          {chats?.map((chat, index) => {
            console.log(`DEBUG - Rendering chat: ${chat.id} (${chat.name})`);
            return (
              <Button
                className="py-2 justify-start text-start items-start w-full min-h-11 !overflow-hidden"
                key={index}
                onMouseEnter={() => prefetchMessages(chat.id)}
                onClick={() => {
                  router.replace(`/chat/${chat.id}`, { scroll: false });
                  if (widthOfScreen < DESKTOP_BREAKPOINT && asideIsOpen)
                    toggleAside();
                }}
                variant={{
                  size: "sm",
                  color: chatId == chat.id ? "quarternary" : "tertiary",
                  hoverAnimationSize: 0.98,
                  tapAnimationSize: 0.9,
                }}
              >
                <p className="truncate w-full !overflow-hidden">
                  {decodeURIComponent(chat.name)}
                </p>
              </Button>
            );
          })}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
