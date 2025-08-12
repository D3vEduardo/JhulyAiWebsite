"use client";

import { useAside } from "@store/asideMenu";
import { motion } from "motion/react";
import { useWindowSize } from "@hooks/useWindowSize";
import { useIsClient } from "@hooks/useIsClient";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import ChatMessages from "../ChatMessages/ChatMessages";
import PromptForm from "../PromptForm/PromptForm";
import ChatNavBar from "../ChatNavbar/ChatNavbar";
import { ChatProvider } from "@/contexts/ChatContext/Provider";

export default function ChatContainer() {
  const { asideIsOpen } = useAside();
  const innerWidth = useWindowSize();
  const isClient = useIsClient();
  const pathname = usePathname();
  const router = useRouter();

  const chatId = pathname.includes("/chat/")
    ? (pathname.split("/").pop() ?? null)
    : null;

  const shouldShowSidebar = useMemo(() => {
    return asideIsOpen && innerWidth > 768;
  }, [asideIsOpen, innerWidth]);

  useEffect(() => {
    const handleChatCreated = (event: CustomEvent) => {
      const { chatId: newChatId } = event.detail;
      if (newChatId) {
        router.replace(`/chat/${newChatId}`);
      }
    };

    window.addEventListener("chat-created", handleChatCreated as EventListener);

    return () => {
      window.removeEventListener(
        "chat-created",
        handleChatCreated as EventListener,
      );
    };
  }, [router]);

  if (!chatId) {
    return (
      <motion.div
        initial={{
          marginLeft: isClient && shouldShowSidebar ? "280px" : undefined,
          width: isClient && shouldShowSidebar ? `calc(100% - 280px)` : "100%",
        }}
        animate={{
          marginLeft: isClient && shouldShowSidebar ? "280px" : undefined,
          width: isClient && shouldShowSidebar ? `calc(100% - 280px)` : "100%",
        }}
        layout={true}
        transition={{ type: "spring", stiffness: 80 }}
        className="w-screen h-svh !overflow-hidden px-[2%] pt-2 relative flex items-center justify-center"
      >
        <div>Selecione um chat ou crie um novo</div>
      </motion.div>
    );
  }

  return (
    <ChatProvider chatId={chatId}>
      <motion.div
        initial={{
          marginLeft: isClient && shouldShowSidebar ? "280px" : undefined,
          width: isClient && shouldShowSidebar ? `calc(100% - 280px)` : "100%",
        }}
        animate={{
          marginLeft: isClient && shouldShowSidebar ? "280px" : undefined,
          width: isClient && shouldShowSidebar ? `calc(100% - 280px)` : "100%",
        }}
        layout={true}
        transition={{ type: "spring", stiffness: 80 }}
        className="w-screen h-svh !overflow-hidden px-[2%] pt-2 relative"
      >
        <ChatNavBar />
        <ChatMessages />
        <PromptForm />
      </motion.div>
    </ChatProvider>
  );
}
