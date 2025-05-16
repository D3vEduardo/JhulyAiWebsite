"use client"

import { useAside } from "@store/asideMenu";
import ChatMessages from "@component/csr/ChatMessages";
import ChatsAside from "@component/csr/ChatsAside";
import MessageForm from "@component/csr/MessageForm";
import { motion } from "motion/react";
import { useState, useEffect } from "react";

export default function Chat() {
    const { asideIsOpen } = useAside();
    const [innerWidth, setInnerWidth] = useState<number>(0);

    useEffect(() => {
        setInnerWidth(window.innerWidth);
        window.addEventListener("resize", () => {
            setInnerWidth(window.innerWidth);
        });
    }, [])

    return (
        <main
            className="flex flex-col w-screen h-dvh relative overflow-hidden"
        >
            <ChatsAside />
            <motion.div
                animate={{
                    marginLeft: asideIsOpen && innerWidth > 768 ? "17.5rem" : "0",
                    width: asideIsOpen && innerWidth > 768 ? `${innerWidth - 280}px` : "100%",
                }}
                className="w-screen relative max-h-dvh overflow-hidden"
            >
                <ChatMessages />
                <MessageForm />
            </motion.div>
        </main>
    )
}