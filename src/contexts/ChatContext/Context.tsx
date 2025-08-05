"use client";

import { createContext } from "react";
import { Message } from "@ai-sdk/react";
import { ChatRequestOptions } from "ai";
interface ChatState {
  chatId: string | null;
  isNewChat: boolean;
  isLoadingMessages: boolean;
  messages: Message[];
  status: "streaming" | "error" | "ready" | "submitted";
  error: Error | undefined;
}

export interface ChatInput {
  value: string;
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
}

export interface ChatActions {
  handleSubmit: (
    event?:
      | {
          preventDefault?: (() => void) | undefined;
        }
      | undefined,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => void;
  stop: () => void;
  addToolResult: ({
    toolCallId,
    result,
  }: {
    toolCallId: string;
    result: unknown;
  }) => void;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
}

export const ChatStateContext = createContext<ChatState | undefined>(undefined);
export const ChatActionsContext = createContext<ChatActions | undefined>(
  undefined,
);
export const ChatInputContext = createContext<ChatInput | undefined>(undefined);
