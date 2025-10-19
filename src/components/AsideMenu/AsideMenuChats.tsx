"use client";

import { honoRPC } from "@/lib/hono/rpc";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../Button";
import { useParams, useRouter } from "next/navigation";
import { useWindowSize } from "@hooks/useWindowSize";
import { DESKTOP_BREAKPOINT, useAside } from "@store/asideMenu";

export default function AsideMenuChats() {
  const widthOfScreen = useWindowSize();
  const { asideIsOpen, toggleAside } = useAside();
  console.debug(
    "[src/components/AsideMenu/AsideMenuChats.tsx:AsideMenuChats]",
    "Renderizei AsideMenuChats"
  );
  const router = useRouter();
  const queryClient = useQueryClient();
  const { chatId } = useParams();
  console.debug(
    "[src/components/AsideMenu/AsideMenuChats.tsx:AsideMenuChats]",
    "DEBUG - Current chatId in Aside:",
    chatId
  );
  const { data: chats, isPending: getChatsIsPending } = useQuery<
    {
      id: string;
      name: string;
      ownerId: string;
      createdAt: string;
      updatedAt: string;
    }[]
  >({
    queryKey: ["chats"],
    queryFn: async () => {
      console.debug(
        "[src/components/AsideMenu/AsideMenuChats.tsx:AsideMenuChats]",
        "Getting user chats..."
      );
      const apiResponse = await honoRPC.api.users.me.chats.$get();
      if (!apiResponse.ok) {
        console.debug(
          "[src/components/AsideMenu/AsideMenuChats.tsx:AsideMenuChats]",
          "Error fetching user chats:",
          apiResponse.statusText
        );
        return [];
      }

      const apiResponseData = await apiResponse.json();
      const userChats = apiResponseData.data;
      console.debug(
        "[src/components/AsideMenu/AsideMenuChats.tsx:AsideMenuChats]",
        "Get user chats is completed!"
      );

      window.dispatchEvent(
        new CustomEvent("chats-query-loaded", {
          detail: {
            chats: userChats,
          },
        })
      );

      return userChats || [];
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const prefetchMessages = (chatId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["chat", `chat_${chatId}`],
      queryFn: async () => {
        if (
          !chatId ||
          chatId === "new" ||
          chatId === "null" ||
          chatId === "undefined"
        ) {
          return [];
        }

        console.debug(
          `[src/components/AsideMenu/AsideMenuChats.tsx:prefetchMessages] Fazendo prefetch de mensagens do chat '${chatId}'...`
        );
        const apiResponse = await honoRPC.api.users.me.chats[
          ":chatId"
        ].messages.$get({
          param: {
            chatId,
          },
        });

        if (!apiResponse.ok) {
          let bodyText = "";
          try {
            bodyText = await apiResponse.text();
          } catch (e) {
            bodyText = `<unable to read body: ${String(e)}>`;
          }
          console.debug(
            "[src/components/AsideMenu/AsideMenuChats.tsx:prefetchMessages]",
            `Erro ao buscar mensagens do chat '${chatId}':`,
            apiResponse.status,
            apiResponse.statusText,
            bodyText
          );
          return [];
        }

        const apiResponseData = await apiResponse.json();
        const data = apiResponseData.data;
        console.debug(
          `[src/components/AsideMenu/AsideMenuChats.tsx:prefetchMessages] Prefetch do chat '${chatId}' concluído!`
        );
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
            console.debug(
              `[src/components/AsideMenu/AsideMenuChats.tsx:AsideMenuChats] DEBUG - Rendering chat: ${chat.id} (${chat.name})`
            );
            return (
              <Button
                className="py-2 justify-start text-start items-start w-full min-h-11 !overflow-hidden"
                key={index}
                onMouseEnter={() => prefetchMessages(chat.id)}
                onClick={() => {
                  console.debug(
                    `[src/components/AsideMenu/AsideMenuChats.tsx:AsideMenuChats] click chat -> router.replace`,
                    chat.id,
                    "currentChatId=",
                    chatId
                  );
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
