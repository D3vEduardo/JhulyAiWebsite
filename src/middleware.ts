import { MiddlewareConfig, NextResponse } from "next/server";
import { auth } from "@lib/nextAuth/auth";

export async function middleware(req: Request) {
  const session = await auth();
  console.log("--> session", session);
  const url = new URL(req.url);

  if (url.pathname === "/" || url.pathname.startsWith("/?"))
    return NextResponse.redirect(new URL("/chat/new", url));

  if (url.pathname.startsWith("/chat/") && !session?.user)
    return NextResponse.redirect(new URL("/login", url));

  const protectedRoutes: {
    pathname: string;
    authenticated: boolean;
    redirectUrl: URL;
  }[] = [
    {
      pathname: "/login",
      authenticated: false,
      redirectUrl: new URL("/", url),
    },
  ];

  const currentRoute = protectedRoutes.find(
    (route) => route.pathname === url.pathname
  );
  if (currentRoute) {
    const isAuthenticated = !!session?.user;

    if (currentRoute.authenticated && !isAuthenticated) {
      return NextResponse.redirect(currentRoute.redirectUrl);
    }

    if (!currentRoute.authenticated && isAuthenticated) {
      return NextResponse.redirect(currentRoute.redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config: MiddlewareConfig = {
  matcher: ["/", "/login", "/chat/:path*"],
};
