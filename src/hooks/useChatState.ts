import { useParams } from "next/navigation";

export function useChatState() {
  const params = useParams();
  const selectedChatId = params?.chatId as string;

  const isNewChat = selectedChatId === "new";
  const chatId = isNewChat ? null : selectedChatId;

  return { chatId, isNewChat, selectedChatId };
}
