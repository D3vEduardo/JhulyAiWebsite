"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@components/Input";
import { useForm } from "react-hook-form";
import Label from "@components/Label";
import { ReactNode } from "react";
import { useEffect } from "react";
import Button from "@components/Button";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import { onboardingFormSchema } from "@lib/zod/onboardingFormSchema";
import { ApiKey, User } from "@prisma/client";
import { RegisterType } from "./types";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import LoadingScreen from "@components/Loading/LoadingScreen";
import { CustomTooltip } from "@components/CustomTooltip";
import { honoRPC } from "@/lib/hono/rpc";

export type PageProps = {
  user: User & {
    apiKey: ApiKey | null;
  };
};

export default function Onboarding() {
  const {
    register,
    handleSubmit,
    setError,
    formState: {
      errors,
      isSubmitSuccessful: formIsSubmitSuccessful,
      isSubmitting: formActionIsSubmitting,
    },
    setValue,
  } = useForm({
    resolver: zodResolver(onboardingFormSchema),
  });

  const { data: uncompletedFields, isLoading: queryIsLoading } = useQuery({
    queryKey: ["onboarding", "uncompletedFields"],
    queryFn: async () => {
      const apiResponse = await honoRPC.api.users.me.onboarding.$get();
      let apiResponseBody;
      if (!apiResponse.ok) {
        apiResponseBody = await apiResponse.json();
        console.error(
          "[src/app/(private)/onboarding/page.tsx:Onboarding]",
          "Erro ao buscar dados do onboarding:",
          apiResponseBody
        );
        throw new Error(
          apiResponseBody?.message || "Erro ao buscar dados do onboarding"
        );
      }

      apiResponseBody = await apiResponse.json();
      console.debug(
        "[src/app/(private)/onboarding/page.tsx:Onboarding]",
        "Dados do onboarding recebidos:",
        apiResponseBody
      );

      const data = apiResponseBody.data;
      if (data.hasCompletedOnboarding) return [];

      // Some API responses include `defaultValues` when onboarding is not
      // completed. Use the `in` operator so TypeScript can narrow the union
      // and allow safe access to `defaultValues`.
      if ("defaultValues" in data && data.defaultValues) {
        // Hono/RPC typing may be too loose here. Narrow the defaults shape
        // so TypeScript understands the expected properties exist.
        const defaults = data.defaultValues as {
          name?: string;
          email?: string;
          apiKey?: string;
        };

        // Provide safe fallbacks to keep setValue happy (expecting strings).
        setValue("name", defaults.name ?? "");
        setValue("email", defaults.email ?? "");
        setValue("apiKey", defaults.apiKey ?? "");
      }

      // Narrow the union before accessing `uncompletedFields` so TS knows it exists
      if (
        "uncompletedFields" in data &&
        Array.isArray(data.uncompletedFields)
      ) {
        return data.uncompletedFields || [];
      }

      return [];
    },
  });
  const router = useRouter();

  useEffect(() => {
    console.debug(
      "[src/app/(private)/onboarding/page.tsx:Onboarding]",
      "Campos não preenchidos:",
      uncompletedFields
    );
  }, [uncompletedFields]);

  if (queryIsLoading) {
    return <LoadingScreen />;
  }

  if (
    !uncompletedFields ||
    (uncompletedFields && uncompletedFields.length === 0)
  ) {
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
      <div className="flex flex-col items-center justify-center text-center">
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
              console.debug(
                "[src/app/(private)/onboarding/page.tsx:Onboarding]",
                "Onboarding data:",
                data
              );

              const apiResponse = await honoRPC.api.users.me.onboarding.$post({
                json: data,
              });

              if (!apiResponse.ok) {
                setError("root", { message: "" });

                const apiResponseBody = await apiResponse.json();

                if (apiResponseBody.message) {
                  Object.entries(apiResponseBody.message).forEach(
                    ([fieldName, message]) => {
                      setError(fieldName as keyof typeof data, {
                        type: "server",
                        message: message,
                      });
                    }
                  );
                }

                if (apiResponseBody.message) {
                  setError("root", {
                    type: "server",
                    message: apiResponseBody.message,
                  });
                }
              }
              if (apiResponse.ok) {
                router.push("/chat/new");
                return;
              }
            } catch (error) {
              console.debug(
                "[src/app/(private)/onboarding/page.tsx:Onboarding]",
                "Erro inesperado no cliente:",
                error
              );
              setError("root", {
                type: "server",
                message: "Erro inesperado. Tente novamente.",
              });
            }
          },
          (validationErrors) => {
            console.debug(
              "[src/app/(private)/onboarding/page.tsx:Onboarding]",
              "Erros de validação detalhados:",
              JSON.stringify(validationErrors, null, 2)
            );

            if (Object.keys(validationErrors).length > 0) {
              setError("root", {
                type: "validation",
                message: "Por favor, corrija os erros nos campos acima.",
              });
            }
          }
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

        {uncompletedFields.length > 0 &&
          uncompletedFields.map(
            (field) => fieldsComponents[field as "name" | "email" | "apiKey"]
          )}

        <Button
          variant={{
            color: "secondary",
            size: "lg",
            hoverAnimationSize: 0.95,
            tapAnimationSize: 0.9,
          }}
          className="w-9/10 sm:w-[450px] md:w-[500px] mt-4 text-2xl space-x-1"
          type="submit"
          disabled={formActionIsSubmitting || formIsSubmitSuccessful}
        >
          <Icon
            icon={
              formActionIsSubmitting ? "mdi:loading" : "lets-icons:save-duotone"
            }
            width="24"
            height="24"
            className={formActionIsSubmitting ? "animate-spin" : ""}
          />
          <p>
            {formActionIsSubmitting
              ? "Salvando..."
              : formIsSubmitSuccessful
                ? "Tudo salvo! Aguarde alguns segundos..."
                : "Salvar"}
          </p>
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
      <CustomTooltip
        noArrow={false}
        id="about-openrouter-apikey"
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
      </CustomTooltip>
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
