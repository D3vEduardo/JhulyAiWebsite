"use server";

import { ReactNode } from "react";
import LoadingScreen from "@components/Loading/LoadingScreen";

export default async function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-svh w-screen flex-col relative">
      {children}
      <LoadingScreen />
    </div>
  );
}
