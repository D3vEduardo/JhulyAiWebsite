import React, { ComponentProps, useMemo, memo } from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { tv } from "tailwind-variants";
import "./highlight.css";

type RoleType = "data" | "system" | "user" | "assistant";
type VariantsType = "user" | "assistant" | "error";

type PropsType = ComponentProps<"figure"> & {
  message: {
    role: RoleType;
    content: string;
  };
  error?: boolean;
};

const ChatBalloon = memo(
  ({ message, error, ...props }: PropsType) => {
    console.log("Renderizei ChatBalloon");
    const variants = tv({
      base: "text-cocoa",
      variants: {
        color: {
          user: "bg-apricot px-4 py-6 rounded-2xl",
          assistant: "",
          error: "bg-danger px-4 py-6 rounded-2xl",
        },
      },
    });

    ChatBalloon.displayName = "ChatBalloon";

    const roles = ["user", "assistant", "error"] as const;
    const color: VariantsType = error
      ? "error"
      : roles.includes(message.role as VariantsType)
      ? (message.role as "user" | "assistant")
      : "assistant";

    const selectedVariant = {
      color,
    };

    // Verificar se a mensagem contém blocos de código
    const containsCode = useMemo(
      () => /```[\s\S]*?```|`[^`]+`/.test(message.content),
      [message.content]
    );

    return (
      <figure className={variants(selectedVariant)} {...props}>
        {containsCode ? (
          <Markdown rehypePlugins={[rehypeHighlight]}>
            {message.content}
          </Markdown>
        ) : (
          <div>{message.content}</div>
        )}
      </figure>
    );
  },
  (prevProps, nextProps) => {
    // Evita re-render se conteúdo e tipo não mudaram
    return (
      prevProps.message.content === nextProps.message.content &&
      prevProps.message.role === nextProps.message.role &&
      prevProps.error === nextProps.error
    );
  }
);

export default ChatBalloon;
