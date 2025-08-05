import type { Metadata } from "next";
import { Itim } from "next/font/google";
import "./globals.css";
import Providers from "@components/Providers";
import { ThemeProvider } from "next-themes";

const ItimFont = Itim({
  variable: "--font-itim",
  weight: ["400"],
  preload: true,
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jhuly AI - Chats",
  description:
    "Crie um chat e converse com a Jhuly. Sua agente ia favorita (e mais fofinha)!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning={true}>
      <body className={`${ItimFont.variable} antialiased w-screen h-dvh`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
