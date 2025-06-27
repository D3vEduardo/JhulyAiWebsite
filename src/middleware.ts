import { MiddlewareConfig, NextResponse } from "next/server";
import { auth } from "@lib/nextAuth/auth";

export async function middleware(req: Request) {
  const session = await auth();
  const url = new URL(req.url);
  const isAuthenticated = !!session?.user;

  if (url.pathname.startsWith("/chat/") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", url));
  }

  if ((url.pathname === "/login" || url.pathname === "/") && isAuthenticated) {
    return NextResponse.redirect(new URL("/chat/new", url));
  }

  if (
    url.pathname === "/" ||
    (url.pathname.startsWith("/?") && !isAuthenticated)
  ) {
    return NextResponse.redirect(new URL("/login", url));
  }

  return NextResponse.next();
}

export const config: MiddlewareConfig = {
  matcher: ["/", "/login", "/chat/:path*"],
};
