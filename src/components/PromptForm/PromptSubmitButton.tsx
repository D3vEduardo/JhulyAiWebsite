"use client";

import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Button from "../Button";
import { useChatContext } from "@/contexts/ChatContext/Hooks";

export default function PromptSubmitButton() {
  const { stop, messages, isLoading } = useChatContext();
  const messagesLength = messages.length;

  return (
    <Button
      type={!isLoading ? "submit" : "button"}
      className="aspect-square w-12 h-12 p-0 flex items-center
      justify-center prompt-form-button"
      data-tooltip-content="Enviar prompt"
      variant={{
        color: !isLoading ? "secondary" : "danger",
        size: "sm",
      }}
      onClick={() => {
        if (!!isLoading) stop();
      }}
    >
      {!isLoading ? (
        <Icon
          icon="iconamoon:send-bold"
          width="24"
          height="24"
          className="-rotate-45"
        />
      ) : messagesLength > 0 ? (
        <Icon
          icon="material-symbols:stop-circle-outline-rounded"
          width="24"
          height="24"
        />
      ) : (
        <span className="w-full h-full relative flex items-center justify-center overflow-hidden scale-[0.8]">
          <Icon
            icon="line-md:loading-loop"
            width="44"
            height="44"
            className="absolute"
          />
          <Icon icon="hugeicons:square" width="24" height="24" />
        </span>
      )}
    </Button>
  );
}
