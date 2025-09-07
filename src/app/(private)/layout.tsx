import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { debug } from "debug";

import { getCachedUser } from "@data/user/getCachedUser";
import { auth } from "@lib/betterAuth/auth";
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

  // Usar validação crítica para rotas privadas
  const session = await auth.api.getSession({
    headers: reqHeaders,
    query: { disableCookieCache: true }, // Força verificação no banco
  });

  // Página de login: permite acesso sem sessão
  if (pathname === "/login" && !session?.user) {
    log("🔓 Acesso liberado para /login sem sessão");
    return <>{children}</>;
  }

  // Se usuário logado acessa login, redireciona para chat
  if (pathname === "/login" && session?.user) {
    log("⚠️ Usuário já logado, manda pro /chat/new");
    redirect("/chat/new");
    return;
  }

  // CORREÇÃO FINAL: Para outras rotas protegidas, verifica autenticação
  if (!session?.user) {
    // Detectar se há cookies mas não há sessão válida (inconsistência)
    const cookies = reqHeaders.get("cookie") || "";
    const hasAuthCookie = cookies.includes("better-auth");

    if (hasAuthCookie) {
      log("🔍 [SECURITY_AUDIT] Cookie inválido detectado - limpando estado");

      try {
        // Limpar cookies inválidos usando Better Auth
        await auth.api.signOut({
          headers: reqHeaders,
        });
        log("🧹 Cookies inválidos limpos com sucesso");
      } catch (error) {
        log("❌ Erro ao limpar cookies:", error);
      }

      // CORREÇÃO: Usar redirect() simples do Next.js em vez de NextResponse
      // Isso evita o erro "Invalid URL" e permite que o Next.js gerencie o redirecionamento
      log("🔄 Redirecionando para /overview após limpeza de cookies");
      redirect("/overview");
      return;
    }

    // SEGURANÇA: Não expor informações sobre o estado da sessão
    // Redireciona silenciosamente para página pública
    log("⛔ Usuário não autenticado em rota protegida");
    redirect("/overview");
    return;
  }

  log(
    "✅ Sessão válida confirmada no banco:",
    session.user.id,
    session.user.email
  );

  const userDatabase = await getCachedUser(session.user.id, session.user.email);

  if (!userDatabase) {
    log("❌ Usuário não encontrado no banco, manda pro /");
    redirect("/");
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

  return <>{children} </>;
}
