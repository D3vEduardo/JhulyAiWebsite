"use client"

import ChatsAside from "@components/csr/ChatsAside"
import ChatMessages from "@components/csr/ChatMessages";
import MessageForm from "@components/csr/MessageForm";
import { motion } from "motion/react";
import useAside from "@/contexts/aside/useAside";

export default function Chat() {
    const { asideIsOpen } = useAside();
    return (
        <main
            className="flex flex-col w-screen h-dvh relative"
        >
            <ChatsAside />
            <motion.div
                animate={{
                    marginLeft: asideIsOpen && innerWidth > 768 ? "17.5rem" : "0",
                    width: asideIsOpen && innerWidth > 768 ? `${innerWidth - 280}px` : "100%",
                }}
                className="w-screen relative max-h-dvh"
            >
                <ChatMessages />
                <MessageForm />
            </motion.div>
        </main>
    )
}