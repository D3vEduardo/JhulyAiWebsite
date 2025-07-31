// src/app/(private)/onboarding/layout.tsx
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

  // Você pode carregar dados globais para a rota aqui, se quiser
  // Mas melhor deixar os dados específicos para as páginas

  return <>{children}</>;
}
