import { honoRPC } from "@/lib/hono/rpc";
import { z } from "zod";
import { onboardingFormSchema } from "@lib/zod/onboardingFormSchema";

interface ActionResponse {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export interface UserData {
  name?: string;
  email?: string;
  apiKey?: {
    key: string;
  } | null;
}

export async function updateUserData(formData: z.infer<typeof onboardingFormSchema>): Promise<ActionResponse> {
  const parsedForm = onboardingFormSchema.safeParse(formData);
  console.debug("[src/hooks/useOnboardingActions.ts:updateUserData]", "Parsed Onboarding Form Data:", parsedForm);

  if (!parsedForm.success) {
    const fieldErrors: Record<string, string> = {};

    parsedForm.error.issues.forEach((issue) => {
      const fieldName = issue.path[0]?.toString();
      if (fieldName) {
        fieldErrors[fieldName] = issue.message;
      }
    });

    return {
      success: false,
      error: "Dados do formulário inválidos",
      fieldErrors,
    };
  }

  try {
    const apiResponse = await honoRPC.api.users.me.$patch({
      json: parsedForm.data
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return errorData;
    }

    const result = await apiResponse.json();
    return result;
  } catch (error) {
    console.debug("[src/hooks/useOnboardingActions.ts:updateUserData]", "Error updating user data:", error);
    return {
      success: false,
      error: "Erro interno do servidor. Tente novamente.",
    };
  }
}

export async function getUserData(): Promise<UserData | undefined> {
  try {
    const apiResponse = await honoRPC.api.users.me.$get({
      query: {
        name: "true",
        email: "true",
        apiKey: "true",
      }
    });

    if (!apiResponse.ok) {
      console.debug("[src/hooks/useOnboardingActions.ts:getUserData]", "Error fetching user data:", apiResponse.statusText);
      return undefined;
    }

    const result = await apiResponse.json();
    return result.data;
  } catch (error) {
    console.debug("[src/hooks/useOnboardingActions.ts:getUserData]", "Error getting user data:", error);
    return undefined;
  }
}