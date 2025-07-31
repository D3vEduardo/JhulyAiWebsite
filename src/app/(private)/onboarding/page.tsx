"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@components/Input";
import { useForm } from "react-hook-form";
import Label from "@components/Label";
import { ReactNode, useState } from "react";
import Button from "@components/Button";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import { OboardingAction } from "./actions";
import { onboardingFormSchema } from "@lib/zod/onboardingFormSchema";
import { ApiKey, User } from "@prisma/client";
import { FieldsType, RegisterType } from "./types";
import { useRouter } from "next/navigation";
import { Tooltip } from "react-tooltip";

// Definição clara do tipo das props, para manter alinhado
export type PageProps = {
  user: User & {
    apiKey: ApiKey | null;
  };
};

export default function Onboarding({ user }: PageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      apiKey: user?.apiKey?.key || "",
    },
  });

  const requiredFields: FieldsType = ["name", "email", "apiKey"];
  const fieldsNotFilled = requiredFields.filter(
    (field) => !(user as Record<string, unknown>)[field],
  );

  if (fieldsNotFilled.length === 0) {
    router.push("/overview");
    return null;
  }

  const fieldsComponents = {
    name: (
      <NameInput
        register={register}
        error={errors.name?.message}
        key="name-input"
      />
    ),
    email: (
      <EmailInput
        register={register}
        error={errors.email?.message}
        key="email-input"
      />
    ),
    apiKey: (
      <ApiKeyInput
        register={register}
        error={errors.apiKey?.message}
        key="apiKey-input"
      />
    ),
  };

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
        onSubmit={handleSubmit(
          async (data) => {
            try {
              setIsSubmitting(true);
              console.log("Onboarding data:", data);

              const result = await OboardingAction(data);

              if (result.success) {
                router.push("/chat/new");
                return;
              }

              setError("root", { message: "" });

              if (result.fieldErrors) {
                Object.entries(result.fieldErrors).forEach(
                  ([fieldName, message]) => {
                    setError(fieldName as keyof typeof data, {
                      type: "server",
                      message: message,
                    });
                  },
                );
              }

              if (result.error) {
                setError("root", {
                  type: "server",
                  message: result.error,
                });
              }
            } catch (error) {
              console.error("Erro inesperado no cliente:", error);
              setError("root", {
                type: "server",
                message: "Erro inesperado. Tente novamente.",
              });
            } finally {
              setIsSubmitting(false);
            }
          },
          (validationErrors) => {
            console.error("Erros de validação:", validationErrors);
          },
        )}
        className="flex flex-col items-center justify-center w-full mt-5 gap-y-2"
      >
        {errors.root?.message && (
          <div className="w-full max-w-screen md:w-[500px] p-3 mb-2 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <div className="flex items-center space-x-2">
              <Icon icon="mdi:alert-circle" width="20" height="20" />
              <span>{errors.root.message}</span>
            </div>
          </div>
        )}

        {fieldsNotFilled.length > 0 &&
          fieldsNotFilled.map((field) => fieldsComponents[field])}

        <Button
          variant={{
            color: "secondary",
            size: "lg",
            hoverAnimationSize: 0.95,
            tapAnimationSize: 0.9,
          }}
          className="w-9/10 sm:w-[450px] md:w-[500px] mt-4 text-2xl space-x-1"
          type="submit"
          disabled={isSubmitting}
        >
          <Icon
            icon={isSubmitting ? "mdi:loading" : "lets-icons:save-duotone"}
            width="24"
            height="24"
            className={isSubmitting ? "animate-spin" : ""}
          />
          <p>{isSubmitting ? "Salvando..." : "Salvar"}</p>
        </Button>
      </form>
    </dialog>
  );
}

function InputWrapper({ children }: { children: ReactNode }) {
  return (
    <span className="flex flex-col w-9/10 sm:w-[450px] md:w-[500px] justify-start items-start">
      {children}
    </span>
  );
}

function NameInput({
  register,
  error,
}: {
  register: RegisterType;
  error?: string;
}) {
  return (
    <InputWrapper>
      <Label>
        <p>Nome:</p>
      </Label>
      <Input
        type="text"
        placeholder="Fulano..."
        {...register("name")}
        className={`w-full ${error ? "border-red-500 focus:border-red-500" : ""}`}
      />
      {error && (
        <div className="flex items-center space-x-1 mt-1">
          <Icon
            icon="mdi:alert-circle"
            width="16"
            height="16"
            className="text-red-500"
          />
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
    </InputWrapper>
  );
}

function EmailInput({
  register,
  error,
}: {
  register: RegisterType;
  error?: string;
}) {
  return (
    <InputWrapper>
      <Label>
        <p>E-mail:</p>
      </Label>
      <Input
        type="email"
        placeholder="seu@email.com"
        {...register("email")}
        className={`w-full ${error ? "border-red-500 focus:border-red-500" : ""}`}
      />
      {error && (
        <div className="flex items-center space-x-1 mt-1">
          <Icon
            icon="mdi:alert-circle"
            width="16"
            height="16"
            className="text-red-500"
          />
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
    </InputWrapper>
  );
}

function ApiKeyInput({
  register,
  error,
}: {
  register: RegisterType;
  error?: string;
}) {
  return (
    <InputWrapper>
      <Label className="flex justify-start !items-center !text-center gap-x-1.5">
        <Icon
          icon="iconamoon:information-circle-duotone"
          width="18"
          height="18"
          data-tooltip-id="about-openrouter-apikey"
          className="mt-1"
        />
        <p>OpenRouter Api Key: </p>
      </Label>
      <Tooltip
        noArrow={false}
        id="about-openrouter-apikey"
        className="overflow-hidden !rounded-2xl !bg-almond !text-cocoa"
        clickable
        delayHide={500}
      >
        <p>
          Crie sua API key da openrouter clicando{" "}
          <a
            href="https://openrouter.ai/settings/keys"
            className="font-bold underline"
            target="_blank"
            rel="noreferrer"
          >
            aqui
          </a>
          !
        </p>
      </Tooltip>
      <Input
        type="password"
        placeholder="mInHaApIkEY..."
        {...register("apiKey")}
        className={`w-full ${error ? "border-red-500 focus:border-red-500" : ""}`}
      />
      {error && (
        <div className="flex items-center space-x-1 mt-1">
          <Icon
            icon="mdi:alert-circle"
            width="16"
            height="16"
            className="text-red-500"
          />
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
    </InputWrapper>
  );
}
