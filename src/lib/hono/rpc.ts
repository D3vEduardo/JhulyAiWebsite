import { hc } from "hono/client";
import { honoApp } from "./app";
import { clientEnv as env } from "@client.env";

export const honoRPC = hc<typeof honoApp>(env.NEXT_PUBLIC_APP_URL);
