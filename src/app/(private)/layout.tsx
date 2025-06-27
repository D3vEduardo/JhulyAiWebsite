import type { Metadata } from "next";
import { Itim } from "next/font/google";
import "../globals.css";
import { SessionProvider } from "next-auth/react";
import Providers from "@/components/csr/Providers";

const ItimFont = Itim({
  variable: "--font-itim",
  weight: ["400"],
  preload: true,
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jhuly AI - Chats",
  description:
    "Crie um chat e converse com a Jhuly. Sua agente ia favorita (e mais fofinha)!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${ItimFont.variable} antialiased w-screen h-dvh`}>
        <SessionProvider>
          <Providers>{children}</Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
