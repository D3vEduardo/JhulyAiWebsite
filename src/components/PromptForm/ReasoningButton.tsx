"use client";

import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Button from "../Button";
import { Dispatch, SetStateAction, memo } from "react";
import { useChatContext } from "@/contexts/ChatContext/Hooks";

type PropsType = {
  reasoning: boolean;
  setReasoning: Dispatch<SetStateAction<boolean>>;
};
function ReasoningButton({ reasoning, setReasoning }: PropsType) {
  const { isLoading } = useChatContext();

  return (
    <Button
      type="button"
      variant={{ color: reasoning ? "primary" : "quarternary" }}
      className="w-12 h-12 p-2 prompt-form-button"
      data-tooltip-content={
        reasoning ? "Desativar raciocínio" : "Ativar raciocínio"
      }
      disabled={isLoading}
      onClick={() => setReasoning((prev) => !prev)}
    >
      <Icon icon="streamline:brain-remix" width="24" height="24" />
    </Button>
  );
}

export default memo(ReasoningButton);
