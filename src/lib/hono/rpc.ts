import { hc } from "hono/client";
import { honoApp } from "./app";
import { env } from "@env";

export const honoRPC = hc<typeof honoApp>(env.NEXT_PUBLIC_APP_URL);
