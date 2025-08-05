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

  if (pathname === "/login" && !session?.user) {
    log("🔓 Acesso liberado para /login sem sessão");
    return <>{children}</>;
  }

  if (pathname === "/chat/new" && !session?.user) {
    log("⛔ Sem sessão, vai pro /login");
    redirect("/login");
    return;
  }

  if (pathname === "/login" && session?.user) {
    log("⚠️ Usuário já logado, manda pro /chat/new");
    redirect("/chat/new");
    return;
  }

  if (!session?.user) {
    log("⛔ Usuário não autenticado, manda pro /login");
    redirect("/login");
    return;
  }

  log("✅ Sessão válida:", session.user.id, session.user.email);

  const userDatabase = await getCachedUser(session.user.id, session.user.email);

  if (!userDatabase) {
    log("❌ Usuário não encontrado no banco, manda pro /login");
    redirect("/login");
    return;
  }

  log("📦 Usuário encontrado no banco:", userDatabase.id);

  const requiredFields = validateRequiredFields(userDatabase);
  const isGoToOnboarding = requiredFields.length > 0;

  log("🔎 Campos pendentes para onboarding?", requiredFields);

  if (isGoToOnboarding && pathname !== "/onboarding") {
    log("🚦 User precisa completar onboarding. Vai pra /onboarding");
    redirect("/onboarding");
    return;
  }

  if (pathname === "/onboarding" && !isGoToOnboarding) {
    log("🎉 Onboarding completo. Vai pra /chat/new");
    redirect("/chat/new");
    return;
  }

  log("🧱 Renderizando layout com children.");

  return <>{children}</>;
}
