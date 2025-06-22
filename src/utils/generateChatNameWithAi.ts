import { openrouter } from "@lib/openrouter/client";
import { generateText } from "ai";

export async function generateChatNameWithAi(userPrompt: string) {
  const prompt = `
Generate a short, creative, and relevant chat title based on the message content below. The title should describe the topic of the conversation, not answer it. Use the same language as the message. Limit to 50 characters.
Only return the name — no explanations or extra text.
Do not include quotation marks around the name.

Examples:
Message: "Oi, qual o seu nome?"
Title: "Primeiro Contato"

Message: "Preciso de ajuda com JavaScript."
Title: "Debugando com JS"

Message: "Como funciona o sistema solar?"
Title: "Explorando o Espaço"

Message: "${userPrompt}"
Title:
`;

  const aiResponse = await generateText({
    model: openrouter("meta-llama/llama-4-maverick:free"),
    prompt,
    maxTokens: 20,
  });

  const chatName = aiResponse.text.split("\n")[0].trim();

  return chatName;
}
