import type { Metadata } from "next";
import "../../globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
    title: "Jhuly AI - Chats",
    description: "Crie um chat e converse com a Jhuly. Sua agente ia favorita (e mais fofinha)!",
};


export default function ChatLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>

    );
}

