import { Message } from "ai";

export function getMoreRecentMessages({
  messages1,
  messages2,
}: {
  messages1: Message[];
  messages2: Message[];
}) {
  if (messages1.length === 0 && messages2.length === 0) return messages1;
  const groupWithMoreMessage =
    messages1.length > messages2.length ? messages1 : messages2;
  if (messages1.length !== messages2.length) return groupWithMoreMessage;

  const lastMessage1 = messages1[messages1.length - 1];
  const lastMessage2 = messages2[messages2.length - 1];

  if (lastMessage1.createdAt && lastMessage2.createdAt) {
    const timestamp1 = new Date(lastMessage1.createdAt).getTime();
    const timestamp2 = new Date(lastMessage2.createdAt).getTime();

    return timestamp1 > timestamp2 ? timestamp1 : timestamp2;
  }

  if (!lastMessage1.createdAt && !lastMessage2.createdAt)
    return groupWithMoreMessage;

  if (!lastMessage1.createdAt || !lastMessage2.createdAt)
    return lastMessage1.createdAt
      ? lastMessage1.createdAt
      : lastMessage2.createdAt;

  const hasStreamingMessage1 = messages1.some(
    (m) => m.role === "assistant" && (!m.content || m.content != ""),
  );
  const hasStreamingMessage2 = messages2.some(
    (m) => m.role === "assistant" && (!m.content || m.content === ""),
  );

  if (hasStreamingMessage1 && !hasStreamingMessage2) return messages2;
  if (!hasStreamingMessage1 && hasStreamingMessage2) return messages1;

  return messages1;
}
