# Plano de Ação para Resolver o Problema de "Mensagens Fantasmas"

## 1. Análise do Problema

O sintoma principal é que, após algumas trocas de mensagens em um chat, o frontend para de renderizar novas mensagens (tanto as do usuário quanto as da IA), embora o backend confirme que elas foram processadas e salvas com sucesso. Isso resulta em uma dessincronização entre o estado da interface e o estado real no banco de dados.

A análise dos logs do backend e do comportamento descrito aponta para uma falha no mecanismo de atualização de dados do lado do cliente. O problema não é de perda de dados, mas sim de renderização.

**Hipótese Principal:** O mecanismo de data-fetching do frontend (provavelmente SWR, TanStack Query/React Query, ou um hook customizado) está servindo dados de um cache obsoleto e não está sendo acionado para buscar os dados atualizados após o envio de uma nova mensagem.

## 2. Fases da Investigação e Correção

A abordagem será dividida em três fases: diagnóstico, implementação da correção e verificação.

---

### Fase 1: Diagnóstico e Análise do Fluxo de Dados

O objetivo desta fase é identificar o ponto exato da falha no fluxo de dados do frontend.

**Passo 1.1: Analisar o Componente de Envio de Mensagem (`PromptForm.tsx`)**

- **O que fazer:** Inspecionar o código da função que lida com o envio do formulário (provavelmente `handleSubmit` ou uma função similar).
- **O que procurar:**
  - Como a requisição `POST` para `/api/chat` é feita.
  - O que acontece no `callback` de sucesso da requisição (`.then()` ou `await`).
  - **Ponto Crítico:** Verificar se existe alguma lógica para notificar outros componentes de que os dados foram atualizados. Especificamente, procurar por chamadas como `mutate()` (típico do SWR) ou `queryClient.invalidateQueries()` (típico do React Query). A ausência dessa chamada é a causa mais provável do problema.

**Passo 1.2: Analisar o Hook de Busca de Mensagens (`useChatMessages.ts` e `getChatMessages.ts`)**

- **O que fazer:** Entender como as mensagens do chat são buscadas e disponibilizadas para os componentes.
- **O que procurar:**
  - Qual biblioteca de data-fetching está sendo usada (SWR, React Query, etc.).
  - A chave de cache (`queryKey`) usada para armazenar os dados do chat. Ela provavelmente inclui o `chatId`.
  - As opções de configuração do hook, como `revalidateOnFocus`, `staleTime`, etc., para entender o comportamento do cache.

**Passo 1.3: Analisar o Contêiner de Mensagens (`MessagesContainer.tsx`)**

- **O que fazer:** Verificar como os dados do hook são consumidos e renderizados.
- **O que procurar:**
  - Como o hook `useChatMessages` é chamado.
  - Se há alguma lógica condicional que possa impedir a renderização da lista de mensagens.
  - Inspecionar o loop de renderização (ex: `.map()`) no componente `ChatMessages.tsx` para garantir que as `key`s utilizadas são únicas e estáveis (ex: `message.id`), pois `key`s instáveis podem causar problemas de renderização no React.

---

### Fase 2: Implementação da Correção

Com base nos achados da Fase 1, a correção provavelmente envolverá garantir que o cache de dados seja invalidado após o envio de uma nova mensagem.

**Solução Proposta (Mais Provável):**

No componente `PromptForm.tsx`, após a confirmação de que a mensagem foi enviada com sucesso, é necessário acionar a invalidação do cache das mensagens do chat.

**Exemplo de Código (se estiver usando SWR):**

O hook `useChatMessages` precisa expor a função `mutate`.

```typescript
// Em: src/hooks/useChatMessages.ts
import useSWR from "swr";
// ...
export const useChatMessages = (chatId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/chat/${chatId}`,
    fetcher,
  );
  // ...
  return { messages: data, error, isLoading, mutate }; // Expor mutate
};

// Em: src/components/PromptForm/PromptForm.tsx
import { useChatMessages } from "@/hooks/useChatMessages";

// ... dentro do componente
const { mutate } = useChatMessages(chatId);

const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  // ... (lógica para pegar o input do usuário)

  // Envia a mensagem para a API
  const response = await fetch("/api/chat", {
    method: "POST",
    // ... headers e body
  });

  if (response.ok) {
    // Limpa o input
    // ...

    // **A CORREÇÃO:** Força a revalidação (re-fetch) dos dados do chat.
    // Isso notificará o SWR para buscar as mensagens mais recentes.
    await mutate();
  } else {
    // Lidar com erros
  }
};
```

**Exemplo de Código (se estiver usando TanStack Query/React Query):**

```typescript
// Em: src/components/PromptForm/PromptForm.tsx
import { useQueryClient, useMutation } from "@tanstack/react-query";

// ... dentro do componente
const queryClient = useQueryClient();

const sendMessageMutation = useMutation({
  mutationFn: (newMessage: any) =>
    fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify(newMessage),
      headers: { "Content-Type": "application/json" },
    }),
  onSuccess: () => {
    // **A CORREÇÃO:** Invalida a query das mensagens do chat, forçando um re-fetch.
    queryClient.invalidateQueries({ queryKey: ["chatMessages", chatId] });
  },
  onError: (error) => {
    // Lidar com erros
  },
});

const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  const userInput = // ...
    sendMessageMutation.mutate({ text: userInput, chatId });
  // ... (limpar input)
};
```

---

### Fase 3: Verificação e Testes

Após aplicar a correção, é crucial verificar se o problema foi resolvido e se nenhum novo bug foi introduzido.

**Passo 3.1: Teste de Resolução**

- Iniciar um novo chat.
- Enviar múltiplas mensagens (5 ou mais) em sequência.
- **Critério de Sucesso:** Todas as mensagens (do usuário e da IA) devem aparecer na interface em tempo real, sem "fantasmas".

**Passo 3.2: Teste de Regressão**

- Abrir um chat antigo.
- **Critério de Sucesso:** O histórico de mensagens deve carregar corretamente.
- Enviar uma nova mensagem em um chat antigo.
- **Critério de Sucesso:** A nova mensagem deve ser adicionada à conversa e renderizada corretamente.
- Atualizar a página (F5) durante uma conversa.
- **Critério de Sucesso:** O chat deve recarregar com todo o histórico de mensagens, incluindo as mais recentes.

Este plano estruturado garante uma abordagem metódica para identificar e corrigir o bug, minimizando o risco e garantindo uma solução robusta.
