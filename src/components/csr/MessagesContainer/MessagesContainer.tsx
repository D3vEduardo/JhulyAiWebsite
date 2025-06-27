"use client";

import { useAside } from "@store/asideMenu";
import { motion } from "motion/react";
import ChatMessages from "../ChatMessages/ChatMessages";
import PromptForm from "../PromptForm/PromptForm";
import ChatNavBar from "../ChatNavbar";
import { useWindowResize } from "@hooks/useWindowSize";
import { useChatContext } from "@/contexts/ChatContext";

export default function MessageContainer() {
  const { asideIsOpen } = useAside();
  const innerWidth = useWindowResize();

  const shouldShowSidebar = asideIsOpen && innerWidth > 768;
  const containerStyle = {
    marginLeft: shouldShowSidebar ? "17.5rem" : "0",
    width: shouldShowSidebar ? `${innerWidth - 280}px` : "100%",
  };

  return (
    <motion.div
      animate={containerStyle}
      transition={{
        duration: 0.5,
        type: "spring",
      }}
      className="w-screen h-screen relative max-h-dvh overflow-hidden px-[2%] pt-2"
    >
      <ChatNavBar />
      <ChatMessages />
      <PromptForm />
    </motion.div>
  );
}
