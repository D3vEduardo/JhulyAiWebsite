import { MiddlewareConfig, NextResponse } from "next/server";
import { auth } from "./lib/nextAuth/auth";

export async function middleware(req: Request) {
    const session = await auth();
    console.log(session);

    const protectedRoutes = ["/chat"];
    const loginRoute = "/login"
    const url = new URL(req.url);

    if (protectedRoutes.includes(url.pathname) && !session) return NextResponse.redirect(new URL("/", req.url));
    if (url.pathname === loginRoute && session) return NextResponse.redirect(new URL("/chat", req.url))
    return NextResponse.next();
}

export const config: MiddlewareConfig = {
    matcher: [
        "/chat",
        "/login"
    ]
}