import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { debug } from "debug";

const log = debug("app:middleware");

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const isAuthenticated = !!getSessionCookie(req);

  log(
    "🛡️ Middleware executando para:",
    url.pathname,
    "| Autenticado:",
    isAuthenticated
  );

  // const publicRoutes = ["/login", "/overview", "/"];
  // const isPublicRoute = publicRoutes.includes(url.pathname);

  const protectedRoutes = ["/chat", "/onboarding"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    url.pathname.startsWith(route)
  );
  if (isProtectedRoute && !isAuthenticated) {
    log("⛔ Rota protegida sem auth, redirecionando para /overview");
    return NextResponse.redirect(new URL("/overview", url));
  }
  if ((url.pathname === "/login" || url.pathname === "/") && isAuthenticated) {
    log(
      "✅ Usuário autenticado acessando rota pública, redirecionando para /chat/new"
    );
    return NextResponse.redirect(new URL("/chat/new", url));
  }
  if (url.pathname === "/" && !isAuthenticated) {
    log("🏠 Home sem auth, redirecionando para /overview");
    return NextResponse.redirect(new URL("/overview", url));
  }

  log("✅ Middleware permitindo acesso a:", url.pathname);
  const response = NextResponse.next();
  response.headers.set("x-invoke-path", url.pathname);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  log("✅ Middleware processado com sucesso", { pathname: url.pathname });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
