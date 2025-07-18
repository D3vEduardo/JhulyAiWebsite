import type { Metadata } from "next";
import { Itim } from "next/font/google";
import "../globals.css";
import Providers from "@/components/Providers";

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
