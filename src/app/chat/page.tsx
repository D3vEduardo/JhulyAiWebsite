"use client"

import ChatsAside from "@components/csr/ChatsAside"
import ChatMessages from "@components/csr/ChatMessages";
import MessageForm from "@components/csr/MessageForm";

export default function Chat() {
    return (
        <main>
            <ChatsAside />
            <div
                className="w-screen md:w-[calc(100vw-17.5rem)] ml-0 md:ml-[17.5rem] relative max-h-dvh"
            >
                <ChatMessages />
                <MessageForm />
            </div>
        </main>
    )
}