"use client"

import Button from "@component/csr/Button";
import { Icon } from "@iconify-icon/react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    return (
        <main
            className="flex flex-col items-center justify-center h-svh w-screen bg-login-bg"
        >
            <div
                className="px-2 py-4 flex flex-col items-center justify-center gap-4 text-center
                bg-navbar rounded-2xl max-w-[300px]"
            >
                <h1 className="text-4xl overflow-hidden pb-1">
                    Faça LogIn com sua conta
                </h1>
                <Button
                    onClick={() => signIn("discord")}
                    className="flex gap-1.5 w-9/10"
                >
                    <Icon icon="mingcute:discord-fill" width="24" height="24" />
                    Discord
                </Button>
                <Button
                    onClick={() => signIn("github")}
                    variant={{
                        color: "secondary"
                    }}
                    className="flex gap-1.5 w-9/10"
                >
                    GitHub
                    <Icon icon="mingcute:github-fill" width="24" height="24" />
                </Button>
            </div>
        </main>
    )
}