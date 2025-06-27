import type { Metadata } from "next";
import { Itim } from "next/font/google";
import "../globals.css";
import { SessionProvider } from "next-auth/react";

const ItimFont = Itim({
  variable: "--font-itim",
  weight: ["400"],
  preload: true,
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jhuly AI",
  description: "Agente IA que te ajuda com código.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${ItimFont.variable} antialiased w-screen h-dvh`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
