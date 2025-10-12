"use client";

import { hc } from "hono/client";
import { honoApp } from "./app";
import { clientEnv } from "@client.env";

export const honoRPC = hc<typeof honoApp>(clientEnv.NEXT_PUBLIC_APP_URL);
