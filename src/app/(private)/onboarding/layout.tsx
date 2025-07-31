"use server";

import Onboarding from "./page";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@lib/prisma/client";
import { getCachedSession } from "@data/auth/getCachedSession";

export default async function OnboardingLayout() {
  const header = await headers();
  const session = await getCachedSession(header);

  if (!session || !session.user) {
    redirect("/overview");
    return;
  }

  const userDatabase = await prisma.user.findUnique({
    where: {
      id: session.user.id,
      email: session.user.email,
    },
    include: {
      apiKey: true,
    },
  });

  if (!userDatabase) {
    redirect("/login");
    return;
  }

  return <Onboarding user={userDatabase} />;
}
