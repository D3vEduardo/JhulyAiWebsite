import { Message } from "ai";

type MessageType = {
    id: string;
    role: string;
    content: string;
    chatId: string;
    senderId: string | null;
};

export function ConvertMessageOfDatabaseToAiModel(messages: MessageType[]) {
    const formatedMessages = [];
    
    for (const message of messages) {
        const formatedMessage: Message = {
            role: message.role as "system" | "user" | "assistant" | "data",
            content: message.content,
            id: message.id,
        }

        formatedMessages.push(formatedMessage);
    }

    return formatedMessages;
}