"use server";

import { NextResponse } from "next/server";

import { getSessionCookie } from "better-auth/cookies";

export async function middleware(req: Request) {
  const session = await getSessionCookie(req);

  const url = new URL(req.url);
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
    return NextResponse.redirect(new URL("/login", url));
  }

  return NextResponse.next();
}
