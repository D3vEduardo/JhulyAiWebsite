import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(req: NextRequest) {
  const session = getSessionCookie(req);

  const url = req.nextUrl.clone();
  const isAuthenticated = !!session;

  // Se for rota /chat/* e não autenticado, redireciona para /overview
  if (url.pathname.startsWith("/chat/") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/overview", url));
  }

  // Se for /login ou / e estiver autenticado, redireciona para /chat/new
  if ((url.pathname === "/login" || url.pathname === "/") && isAuthenticated) {
    return NextResponse.redirect(new URL("/chat/new", url));
  }

  // Se for / ou /?* e não autenticado, redireciona para /overview
  if (
    url.pathname === "/" ||
    (url.pathname.startsWith("/?") && !isAuthenticated)
  ) {
    return NextResponse.redirect(new URL("/overview", url));
  }

  // Se for /onboarding e não autenticado, redireciona para /overview
  if (url.pathname === "/onboarding" && !isAuthenticated) {
    return NextResponse.redirect(new URL("/overview", url));
  }

  // Caso não tenha redirecionado, cria response com header x-invoke-path
  const response = NextResponse.next();

  response.headers.set("x-invoke-path", url.pathname);

  return response;
}

// Configurar onde aplicar (ajuste o matcher conforme seu app)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
