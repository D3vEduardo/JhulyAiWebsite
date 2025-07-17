import { ReactNode } from "react";
import { auth } from "@lib/betterAuth/auth";
import { headers } from "next/headers";
import { GoToOnboarding } from "@utils/goToOnboarding";
import Onboarding from "@components/Onboarding";
import { debug } from "debug";
import LoadingScreen from "@/components/Loading/LoadingScreen";
const log = debug("app:chat:layout");

export default async function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  const authResponse = await auth.api.getSession({
    headers: await headers(),
  });
  const { user } = authResponse ? authResponse : { user: null };
  log(user);
  return (
    <div className="flex h-svh w-screen flex-col relative">
      {children}
      {user && GoToOnboarding(user) ? <Onboarding /> : null}
      <LoadingScreen />
    </div>
  );
}
