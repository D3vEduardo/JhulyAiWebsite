"use client";

import { useQuery } from "@tanstack/react-query";
import Button from "../Button";
import { getUserChats } from "./getUserChats";
import { redirect } from "next/navigation";

export default function AsideMenuChats() {
console.log("Renderizei AsideMenuChats");
  const { data: chats, isPending: getChatsIsPending } = useQuery<
    {
      id: string;
      name: string;
      ownerId: string;
    }[]
  >({
    queryKey: ["chats"],
    queryFn: async () => {
      const userChats = await getUserChats();
      return userChats || [];
    },
    staleTime: 60 * 1000,
  });

  return (
    <div className="mt-4 overflow-y-auto">
      {!getChatsIsPending ? (
        chats?.map((chat, index) => (
          <Button
            className="py-2 justify-start text-start items-start w-full min-h-11 !overflow-hidden"
            key={index}
            onClick={() => redirect(`/?chatId=${chat.id}`)}
            variant={{
              size: "sm",
              color: index == 1 ? "quarternary" : "tertiary",
              hoverAnimationSize: 0.98,
              tapAnimationSize: 0.9,
            }}
          >
            <p className="truncate w-full !overflow-hidden">{chat.name}</p>
          </Button>
        ))
      ) : (
        <span>loading...</span>
      )}
    </div>
  );
}
