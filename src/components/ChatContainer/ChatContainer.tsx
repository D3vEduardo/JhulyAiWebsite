"use client";

import { useAside } from "@store/asideMenu";
import { motion } from "motion/react";
import { useWindowSize } from "@hooks/useWindowSize";
import { useIsClient } from "@hooks/useIsClient";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef, useLayoutEffect } from "react";

import ChatMessages from "../ChatMessages/ChatMessages";
import PromptForm from "../PromptForm/PromptForm";
import ChatNavBar from "../ChatNavbar/ChatNavbar";
import { ChatProvider } from "@/contexts/ChatContext/Provider";

export default function ChatContainer() {
  const { asideIsOpen } = useAside();
  useWindowSize();
  const isClient = useIsClient();
  const { isDesktop } = useAside();
  const pathname = usePathname();
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);
  useLayoutEffect(() => {
    setHydrated(true);
  }, []);

  const chatId = pathname.includes("/chat/")
    ? (pathname.split("/").pop() ?? null)
    : null;

  console.debug(
    "[src/components/ChatContainer/ChatContainer.tsx:ChatContainer] render",
    "chatId=",
    chatId,
    "asideIsOpen=",
    asideIsOpen,
    "isDesktop=",
    isDesktop
  );

  const shouldShowSidebar = useMemo(() => {
    return asideIsOpen && isDesktop;
  }, [asideIsOpen, isDesktop]);

  const [appliedSidebar, setAppliedSidebar] =
    useState<boolean>(shouldShowSidebar);
  const appliedSidebarRef = useRef<boolean>(shouldShowSidebar);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (appliedSidebarRef.current !== shouldShowSidebar) {
        appliedSidebarRef.current = shouldShowSidebar;
        setAppliedSidebar(shouldShowSidebar);
        console.debug(
          "[src/components/ChatContainer/ChatContainer.tsx:ChatContainer] appliedSidebar changed",
          shouldShowSidebar
        );
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [shouldShowSidebar]);

  const initialMountRef = useRef(true);
  useLayoutEffect(() => {
    initialMountRef.current = false;
  }, []);

  useEffect(() => {
    const handleChatCreated = (event: CustomEvent) => {
      const { chatId: newChatId } = event.detail;
      if (newChatId) {
        router.replace(`/chat/${newChatId}`);
      }
    };

    window.addEventListener("chat-created", handleChatCreated as EventListener);

    console.debug(
      "[src/components/ChatContainer/ChatContainer.tsx:ChatContainer] added chat-created listener"
    );

    return () => {
      window.removeEventListener(
        "chat-created",
        handleChatCreated as EventListener
      );
    };
  }, [router]);

  const animateStyles = useMemo(
    () => ({
      transform: appliedSidebar ? "translateX(280px)" : "translateX(0)",
      width: appliedSidebar ? "calc(100% - 280px)" : "100%",
    }),
    [appliedSidebar]
  );

  console.debug(
    "[src/components/ChatContainer/ChatContainer.tsx:ChatContainer] animateStyles computed",
    "appliedSidebar=",
    appliedSidebar,
    "transform=",
    animateStyles.transform
  );

  if (isClient) {
    const absTranslateX = appliedSidebar ? 280 : 0;
    const absWidthPx = Math.max(0, window.innerWidth);
    console.debug(
      "[src/components/ChatContainer/ChatContainer.tsx:ChatContainer] animateStyles px",
      "absTranslateX=",
      absTranslateX,
      "absWidthPx=",
      absWidthPx
    );
  }

  if (!hydrated) return null;

  if (!chatId) {
    return (
      <motion.div
        initial={false}
        animate={animateStyles}
        layout={true}
        transition={
          initialMountRef.current
            ? { duration: 0 }
            : { type: "spring", stiffness: 80 }
        }
        className="w-screen h-svh !overflow-hidden px-[2%] pt-2 relative flex flex-col items-center justify-center"
      >
        <div>Selecione um chat ou crie um novo</div>
      </motion.div>
    );
  }

  return (
    <ChatProvider chatId={chatId}>
      <motion.div
        initial={false}
        animate={animateStyles}
        layout={true}
        transition={
          initialMountRef.current
            ? { duration: 0 }
            : { type: "spring", stiffness: 80 }
        }
        className="w-screen h-svh !overflow-hidden px-[2%] pt-2 relative flex flex-col"
      >
        <ChatNavBar />
        <ChatMessages />
        <PromptForm />
      </motion.div>
    </ChatProvider>
  );
}
