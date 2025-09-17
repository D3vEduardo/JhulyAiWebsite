import { debug } from "debug";
import { generateText, LanguageModel } from "ai";
const log = debug("app:utils:generateChatName");

let lastCall = 0;
const RATE_LIMIT_MS = 15_000;

export async function generateChatNameWithAi({
  userPrompt,
  model,
}: {
  userPrompt: string;
  model: LanguageModel;
}) {
  const now = Date.now();
  if (now - lastCall < RATE_LIMIT_MS) {
    console.warn("[generateChatNameWithAi] Cooldown ativo");
    return "Novo Chat 🤖";
  }
  lastCall = now;

  const prompt = `
Você é um gerador de títulos curtos e descritivos.  
Dado o conteúdo de uma mensagem, gere um título em pt-BR que resuma o assunto do chat.  
O título deve ser curto, direto ao ponto, e sem responder à mensagem.  
Não reescreva a mensagem.  
Não adicione "Título:" ou qualquer outro prefixo.

Exemplos:

Mensagem: "oi tudo bem"
Título: Saudação Inicial

Mensagem: "como faço login com github usando next-auth?"
Título: Autenticação com GitHub no NextAuth

Mensagem: "${userPrompt}"
Título:
`;

  try {
    const aiResponse = await generateText({
      model,
      prompt,
      maxOutputTokens: 10,
      temperature: 0.5,
    });

    const chatName = aiResponse.text.trim().replace(/\n/g, "");
    return chatName || "Chat Sem Nome 🤔";
  } catch (err: unknown) {
    log("Erro ao gerar nome do chat via IA:", err);
    // if (
    //   (err?.message &&
    //     err?.message.toLowerCase().includes("too many requests")) ||
    //   err?.message?.includes("429")
    // ) {
    //   return "Aguardando IA 🕐";
    // }
    return "Novo Chat 🤖";
  }
}
