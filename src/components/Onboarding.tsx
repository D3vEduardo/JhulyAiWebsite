"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "./Input";
import { useForm } from "react-hook-form";
import Label from "@components/Label";
import { ReactNode } from "react";
import Button from "./Button";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import { userSchema } from "@lib/zod/userSchema";

export default function Onboarding() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(userSchema),
  });

  return (
    <dialog
      className="flex flex-col h-svh w-screen items-center justify-center absolute left-0 top-0
        bg-vanilla/50 backdrop-blur-md z-[99]"
    >
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl py-1 font-bold text-cocoa">
          Bem-vindo ao Onboarding!
        </h1>
        <p className="text-lg -mt-1 text-cinnamon">
          Preencha os campos abaixo para continuar.
        </p>
      </div>
      <form
        onSubmit={handleSubmit((data) => {
          // TODO: Criar server action para salvar os dados do usuário (com validação usando o zod) e atualizar os dados do better auth
          console.log(data);
        })}
        className="flex flex-col items-center justify-center w-full mt-5 gap-y-2"
      >
        <InputWrapper>
          <Label>
            <p>Nome:</p>
          </Label>
          <Input
            type="text"
            placeholder="Fulano..."
            {...register("name")}
            className="w-full max-w-screen md:w-[500px]"
          />
        </InputWrapper>
        <InputWrapper>
          <Label>
            <p>E-mail:</p>
          </Label>
          <Input
            type="email"
            placeholder="seu@email.com"
            {...register("email")}
            className="w-full max-w-screen md:w-[500px]"
          />
        </InputWrapper>
        <InputWrapper>
          <Label>
            <p>Api Key:</p>
          </Label>
          <Input
            type="password"
            placeholder="mInHaApIkEY..."
            {...register("apiKey")}
            className="w-full max-w-screen md:w-[500px]"
          />
        </InputWrapper>
        <Button
          variant={{
            color: "secondary",
            size: "lg",
            hoverAnimationSize: 0.95,
            tapAnimationSize: 0.9,
          }}
          className="w-full max-w-screen md:w-[500px] mt-4 text-2xl space-x-1"
          type="submit"
        >
          <Icon icon="lets-icons:save-duotone" width="24" height="24" />
          <p>Salvar</p>
        </Button>
      </form>
    </dialog>
  );
}

function InputWrapper({ children }: { children: ReactNode }) {
  return (
    <span className="flex flex-col w-auto justify-start items-start">
      {children}
    </span>
  );
}
