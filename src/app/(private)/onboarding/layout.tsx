"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCachedSession } from "@data/auth/getCachedSession";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const header = await headers();
  const session = await getCachedSession(header);

  if (!session || !session.user) {
    redirect("/overview");
  }

  return <>{children}</>;
}
