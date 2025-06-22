import { MiddlewareConfig, NextResponse } from "next/server";
import { auth } from "@lib/nextAuth/auth";

export async function middleware(req: Request) {
    const session = await auth();
    console.log("--> session", session);
    const url = new URL(req.url);

    const protectedRoutes: {
        pathname: string;
        authenticated: boolean;
        redirectUrl: URL;
    }[] = [
        {
            pathname: "/",
            authenticated: true,
            redirectUrl: new URL("/overview", url)
        },
        {
            pathname: "/login",
            authenticated: false,
            redirectUrl: new URL("/", url)
        }
    ]

    const currentRoute = protectedRoutes.find(route => route.pathname === url.pathname);
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
    matcher: [
        "/",
        "/login"
    ]
}