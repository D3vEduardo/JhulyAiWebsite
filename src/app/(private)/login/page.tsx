"use client";

import Button from "@components/Button";
import Input from "@components/Input";
import { Icon } from "@iconify-icon/react";
import Image from "next/image";
import ImageJhulySorrindo from "../../../../public/stickers/jhuly_sorrindo.png";
import ImageJhulyOi from "../../../../public/stickers/jhuly_oi.png";
import { twMerge } from "tailwind-merge";
import { authClient } from "@lib/betterAuth/auth-client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { HTMLMotionProps } from "motion/react";
import { ReactNode } from "react";
import Label from "@components/Label";

const LoginFormSchema = z.object({
  email: z.email({
    error: "Por favor, insira um e-mail.",
  }),
});

export default function LoginPage() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(LoginFormSchema),
  });
  return (
    <main className="flex flex-col items-center justify-center h-svh w-screen bg-vanilla overflow-y-auto">
      <div
        className="px-8 py-6 flex flex-col items-center justify-center gap-4 text-center
 bg-peach shadow-2xl rounded-2xl max-w-9/10 border-almond/20 border-3 min-w-9/10 lg:min-w-[550px]"
      >
        <section>
          <div className="flex flex-col items-center justify-center text-center">
            <Image
              className=""
              height={100}
              width={100}
              src={ImageJhulySorrindo}
              alt={ImageJhulyOi.src}
            />
            <h1 className="text-4xl overflow-hidden font-extrabold">
              Bem-vindo!
            </h1>
          </div>
          <p className="font-light text-lg text-cinnamon mt-2">
            Entre em sua Jhuly Account.
          </p>
        </section>
        <section className="w-full space-y-4 p-2">
          <CustomButton
            onClick={() =>
              authClient.signIn.social({
                provider: "discord",
              })
            }
          >
            <Icon icon="mingcute:discord-fill" width="24" height="24" />
            <p>Continuar com Discord</p>
          </CustomButton>
          <CustomButton
            onClick={() =>
              authClient.signIn.social({
                provider: "github",
              })
            }
          >
            <Icon icon="mingcute:github-fill" width="24" height="24" />
            <p>Continuar com GitHub</p>
          </CustomButton>
        </section>
        <div className="flex w-full items-center justify-center px-2">
          <div className="w-full rounded-2xl bg-cinnamon/40 h-0.5" />
          <p className="w-full text-cinnamon/60 text-center">ou com</p>
          <div className="w-full rounded-2xl bg-cinnamon/40 h-0.5" />
        </div>
        <form
          onSubmit={handleSubmit((data) => {
            authClient.signIn.magicLink({
              email: data.email,
            });
          })}
          className="p-2 w-full flex flex-col items-start justify-center gap-y-1"
        >
          <Label htmlFor="email">
            <Icon icon="fluent:mail-copy-32-filled" width="22" height="22" />
            <p>E-mail:</p>
          </Label>
          <div className="space-y-4 w-full">
            <Input
              type="email"
              {...register("email")}
              placeholder="seu@email.com"
            />
            <CustomButton type="submit" className="bg-apricot/80 text-cocoa/80">
              <Icon icon="iconoir:send-mail" width="24" height="24" />
              Enviar Magic Link
            </CustomButton>
          </div>
        </form>
      </div>
    </main>
  );
}

function CustomButton({
  children,
  className,
  ...props
}: HTMLMotionProps<"button"> & { children: ReactNode }) {
  return (
    <Button
      {...props}
      className={twMerge(`flex gap-1.5 w-full text-lg py-3 px-6`, className)}
      variant={{
        color: "quinary",
        hoverAnimationSize: 0.96,
      }}
    >
      {children}
    </Button>
  );
}
