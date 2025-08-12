import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(req: NextRequest) {
  const session = getSessionCookie(req);

  const url = req.nextUrl.clone();
  const isAuthenticated = !!session;

  if (url.pathname.startsWith("/chat/") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/overview", url));
  }

  if ((url.pathname === "/login" || url.pathname === "/") && isAuthenticated) {
    return NextResponse.redirect(new URL("/chat/new", url));
  }

  if (
    url.pathname === "/" ||
    (url.pathname.startsWith("/?") && !isAuthenticated)
  ) {
    return NextResponse.redirect(new URL("/overview", url));
  }

  if (url.pathname === "/onboarding" && !isAuthenticated) {
    return NextResponse.redirect(new URL("/overview", url));
  }

  const response = NextResponse.next();

  response.headers.set("x-invoke-path", url.pathname);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
