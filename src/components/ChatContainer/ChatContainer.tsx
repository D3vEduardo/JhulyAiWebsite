"use client";

import { useAside } from "@store/asideMenu";
import { motion } from "motion/react";
import { useWindowSize } from "@hooks/useWindowSize";
import ChatMessages from "../ChatMessages/ChatMessages";
import PromptForm from "../PromptForm/PromptForm";
import ChatNavBar from "../ChatNavbar/ChatNavbar";
import { useIsClient } from "@hooks/useIsClient";
import { useMemo } from "react";

export default function ChatContainer() {
  const { asideIsOpen } = useAside();
  const innerWidth = useWindowSize();
  const isClient = useIsClient();

  const shouldShowSidebar = useMemo(() => {
    return asideIsOpen && innerWidth > 768;
  }, [asideIsOpen, innerWidth]);

  const containerStyle = useMemo(
    () => ({
      marginLeft: isClient && shouldShowSidebar ? "280px" : undefined,
      width: isClient && shouldShowSidebar ? `calc(100% - 280px)` : "100%",
    }),
    [isClient, shouldShowSidebar],
  );

  return (
    <motion.div
      style={containerStyle}
      layout={true}
      transition={{ type: "spring", stiffness: 80 }}
      className="w-screen h-svh !overflow-hidden px-[2%] pt-2 relative"
    >
      <ChatNavBar />
      <ChatMessages />
      <PromptForm />
    </motion.div>
  );
}
