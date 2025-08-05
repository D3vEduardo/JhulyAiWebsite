import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jhuly AI",
  description: "Agente IA que te ajuda com tudo que você precisa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
