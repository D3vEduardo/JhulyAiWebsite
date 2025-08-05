import type { Metadata } from "next";
import { GoToOnboarding } from "@utils/goToOnboarding";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { debug } from "debug";

import { getCachedUser } from "@data/user/getCachedUser";
import { getCachedSession } from "@data/auth/getCachedSession";
import { FieldsType } from "./onboarding/types";

const log = debug("app:private-routes:layout");

export const metadata: Metadata = {
  title: "Jhuly AI - Chats",
  description:
    "Crie um chat e converse com a Jhuly. Sua agente ia favorita (e mais fofinha)!",
};

interface UserType {
  name?: string | null;
  email?: string | null;
  apiKey?: { key?: string | null } | null;
  [key: string]: unknown;
}

const validateRequiredFields = (user: UserType): string[] => {
  const requiredFields: FieldsType = ["name", "email", "apiKey"];
  return requiredFields.filter((field) => {
    if (field === "apiKey") {
      return !user.apiKey?.key;
    }
    return !user[field];
  });
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const reqHeaders = await headers();
  const pathname = reqHeaders.get("x-invoke-path");

  log("🏁 Iniciando RootLayout para rota protegida");
  log("📍 Pathname:", pathname);

  const session = await getCachedSession(reqHeaders);

  if (!session?.user) {
    log("⛔ Sessão inválida ou ausente. Redirecionando para /overview.");
    redirect("/overview");
  }

  log("✅ Sessão válida:", session.user.id, session.user.email);

  const userDatabase = await getCachedUser(session.user.id, session.user.email);

  if (!userDatabase) {
    log("❌ Usuário não encontrado no banco. Redirecionando para /login.");
    redirect("/login");
  }

  log("📦 Usuário encontrado no banco:", userDatabase.id);

  const isGoToOnboarding = GoToOnboarding(userDatabase);
  log("🔎 Deve ir para onboarding?", isGoToOnboarding);

  // Lógica de redirecionamento
  if (pathname?.startsWith("/chat")) {
    if (isGoToOnboarding) {
      log(
        "🚦 Usuário precisa fazer onboarding. Redirecionando para /onboarding.",
      );
      redirect("/onboarding");
    }
  } else if (pathname === "/onboarding") {
    if (!isGoToOnboarding) {
      log(
        "🔁 Usuário já passou pelo onboarding. Redirecionando para /chat/new.",
      );
      redirect("/chat/new");
    }

    const fieldsNotFilled = validateRequiredFields(userDatabase);
    log("📋 Campos obrigatórios não preenchidos:", fieldsNotFilled);

    if (fieldsNotFilled.length === 0) {
      log(
        "✅ Todos os campos obrigatórios preenchidos. Redirecionando para /chat/new.",
      );
      redirect("/chat/new");
    }
  }

  log("🧱 Renderizando layout com children.");

  return <>{children}</>;
}
