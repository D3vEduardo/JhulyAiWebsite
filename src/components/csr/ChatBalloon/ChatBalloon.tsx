import React, { ComponentProps, memo } from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
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

export default function ChatBalloon({ message, error }: PropsType) {
  console.log("Renderizei ChatBalloon");
  const variants = tv({
    base: "text-cocoa",
    variants: {
      color: {
        user: "bg-apricot px-4 py-6 rounded-2xl",
        assistant: "",
        error: "bg-red-300 px-4 py-6 rounded-2xl text-red-900",
      },
    },
  });

  const roles = ["user", "assistant", "error"] as const;
  const color: VariantsType = error
    ? "error"
    : roles.includes(message.role as VariantsType)
      ? (message.role as "user" | "assistant")
      : "assistant";

  const selectedVariant = {
    color,
  };

  return (
    <figure className={variants(selectedVariant)}>
      <Markdown rehypePlugins={[rehypeHighlight]} remarkPlugins={[remarkGfm]}>
        {message.content}
      </Markdown>
    </figure>
  );
}
