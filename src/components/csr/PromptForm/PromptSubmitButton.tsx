import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Button from "../Button";
import { UseChatHelpers } from "@ai-sdk/react";

type PropsType = {
  chat: UseChatHelpers & {
    addToolResult: ({
      toolCallId,
      result,
    }: {
      toolCallId: string;
      result: unknown;
    }) => void;
  };
  chatIsReady: boolean;
};

export default function PromptSubmitButton({ chatIsReady, chat }: PropsType) {
  return (
    <Button
      type={chatIsReady ? "submit" : "button"}
      className="aspect-square w-12 h-12 p-0 flex items-center justify-center"
      variant={{
        color: chatIsReady ? "secondary" : "danger",
        size: "sm",
      }}
      onClick={() => {
        if (!chatIsReady) chat.stop();
      }}
    >
      {chatIsReady ? (
        <Icon
          icon="iconamoon:send-bold"
          width="24"
          height="24"
          className="-rotate-45"
        />
      ) : chat.messages.length > 0 ? (
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

//
//
