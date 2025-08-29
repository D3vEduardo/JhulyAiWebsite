import { honoApp } from "@/lib/hono/app";
import { handle } from "hono/vercel";

export const GET = handle(honoApp);
export const POST = handle(honoApp);
export const PUT = handle(honoApp);
export const DELETE = handle(honoApp);
export const PATCH = handle(honoApp);
