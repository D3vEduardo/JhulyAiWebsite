# Documentação das Rotas de API

Este documento lista todas as rotas de API no projeto Jhuly AI Website, organizadas por categoria, e indica quais rotas usam paginação e quais não usam.

## 1. Rotas de Administração

### Rota de Usuários Admin
**Arquivo:** `src/api/routes/admin/users/adminUsers.route.ts`

- **Método:** GET
- **Caminho:** `/api/admin/users`
- **Descrição:** Recupera todos os usuários com privilégios administrativos
- **Paginação:** ✅ **SIM** - Usa `paginationBaseSchema` com paginação baseada em cursor
- **Parâmetros de Query:**
  - `cursor` (opcional): Cursor para paginação
  - `limit` (opcional, padrão: 20): Número de registros a recuperar (máximo 30)
  - `onlyAdmin` (opcional): Filtro para mostrar apenas usuários administradores
  - `showAdmin` (opcional): Flag para mostrar usuários administradores
- **Resposta:** Inclui `nextCursor` para paginação

## 2. Rotas de IA

### Rota de Stream de IA
**Arquivo:** `src/api/routes/ai/stream/stream.route.ts`

- **Método:** POST
- **Caminho:** `/api/ai/stream`
- **Descrição:** Lida com streaming de conversas de IA
- **Paginação:** ❌ **NÃO** - Não usa paginação
- **Corpo da Requisição:**
  - `messages`: Array de mensagens
  - `id`: ID do chat
  - `reasoning`: Booleano para habilitar raciocínio
  - `model`: Tipo de modelo a ser usado
- **Resposta:** Resposta de streaming com mensagens de IA

## 3. Rotas de Autenticação

### Rota de Autenticação
**Arquivo:** `src/api/routes/auth/auth.route.ts`

- **Método:** POST/GET
- **Caminho:** `/api/auth/*`
- **Descrição:** Lida com autenticação usando Better Auth
- **Paginação:** ❌ **NÃO** - Não usa paginação
- **Resposta:** Respostas de autenticação baseadas na implementação Better Auth

## 4. Rotas de Usuário

### Rota de Obtenção de Usuário por ID
**Arquivo:** `src/api/routes/users/(userId)/users.route.ts`

- **Método:** GET
- **Caminho:** `/api/users/{userId}`
- **Descrição:** Recupera um usuário específico pelo ID
- **Paginação:** ❌ **NÃO** - Não usa paginação
- **Parâmetros:**
  - `userId` (caminho): ID do usuário
- **Parâmetros de Query:**
  - `name`, `image`, `createdAt`: Campos a selecionar (flags booleanas)
- **Resposta:** Objeto único de usuário baseado nos campos selecionados

### Rota de Obtenção do Usuário Atual
**Arquivo:** `src/api/routes/users/me/usersMe.route.ts`

- **Método:** GET
- **Caminho:** `/api/users/me`
- **Descrição:** Recupera o usuário autenticado atual
- **Paginação:** ❌ **NÃO** - Não usa paginação
- **Parâmetros de Query:**
  - `id`, `name`, `image`, `role`, `createdAt`, `updatedAt`: Campos a selecionar (flags booleanas)
- **Resposta:** Objeto de usuário atual com campos selecionados

### Rota de Obtenção de Chats do Usuário
**Arquivo:** `src/api/routes/users/me/chats/userMeChats.route.ts`

- **Método:** GET
- **Caminho:** `/api/users/me/chats`
- **Descrição:** Recupera chats para o usuário atual
- **Paginação:** ✅ **SIM** - Usa `paginationSchema` com paginação baseada em cursor
- **Parâmetros de Query:**
  - `cursor` (opcional): Cursor para paginação
  - `limit` (opcional, padrão: 20): Número de registros a recuperar (máximo 30)
- **Resposta:** Inclui `nextCursor`, `hasNextPage` e `limit` para paginação

### Rota de Obtenção de Chat por ID
**Arquivo:** `src/api/routes/users/me/chats/(chatId)/userMeChatById.route.ts`

- **Método:** GET
- **Caminho:** `/api/users/me/chats/{chatId}`
- **Descrição:** Recupera um chat específico por ID
- **Paginação:** ❌ **NÃO** - Não usa paginação
- **Parâmetros:**
  - `chatId` (caminho): ID do chat
- **Parâmetros de Query:**
  - `id`, `name`, `ownerId`, `createdAt`, `updatedAt`: Campos a selecionar (flags booleanas)
- **Resposta:** Objeto único de chat com campos selecionados

### Rota de Obtenção de Mensagens do Chat
**Arquivo:** `src/api/routes/users/me/chats/(chatId)/messages/userMeChatMessages.route.ts`

- **Método:** GET
- **Caminho:** `/api/users/me/chats/{chatId}/messages`
- **Descrição:** Recupera mensagens para um chat específico
- **Paginação:** ✅ **SIM** - Usa `paginationSchema` com paginação baseada em cursor
- **Parâmetros:**
  - `chatId` (caminho): ID do chat
- **Parâmetros de Query:**
  - `cursor` (opcional): Cursor para paginação
  - `limit` (opcional, padrão: 20): Número de registros a recuperar (máximo 30)
- **Resposta:** Inclui `nextCursor`, `hasNextPage` e `limit` para paginação

### Rota de Obtenção de Mensagem do Chat por ID
**Arquivo:** `src/api/routes/users/me/chats/(chatId)/messages/(messageId)/userMeChatMessageById.route.ts`

- **Método:** GET
- **Caminho:** `/api/users/me/chats/{chatId}/messages/{messageId}`
- **Descrição:** Recupera uma mensagem específica por ID
- **Paginação:** ❌ **NÃO** - Não usa paginação
- **Parâmetros:**
  - `chatId` (caminho): ID do chat
  - `messageId` (caminho): ID da mensagem
- **Parâmetros de Query:**
  - `id`, `role`, `reasoning`, `content`, `chatId`, `senderId`, `createdAt`, `updatedAt`: Campos a selecionar (flags booleanas)
- **Resposta:** Objeto único de mensagem com campos selecionados

### Rota de Obtenção de Mensagens do Usuário
**Arquivo:** `src/api/routes/users/me/messages/userMeMessages.route.ts`

- **Método:** GET
- **Caminho:** `/api/users/me/messages`
- **Descrição:** Recupera mensagens do usuário atual
- **Paginação:** ✅ **SIM** - Usa `paginationSchema` com paginação baseada em cursor
- **Parâmetros de Query:**
  - `cursor` (opcional): Cursor para paginação
  - `limit` (opcional, padrão: 20): Número de registros a recuperar (máximo 30)
- **Resposta:** Inclui `nextCursor`, `hasNextPage` e `limit` para paginação

### Rota de Obtenção de Mensagem do Usuário por ID
**Arquivo:** `src/api/routes/users/me/messages/(messageId)/userMeMessageById.route.ts`

- **Método:** GET
- **Caminho:** `/api/users/me/messages/{messageId}`
- **Descrição:** Recupera uma mensagem específica por ID
- **Paginação:** ❌ **NÃO** - Não usa paginação
- **Parâmetros:**
  - `messageId` (caminho): ID da mensagem
- **Parâmetros de Query:**
  - `id`, `role`, `reasoning`, `content`, `chatId`, `senderId`, `createdAt`, `updatedAt`: Campos a selecionar (flags booleanas)
- **Resposta:** Objeto único de mensagem com campos selecionados

## Resumo

### Rotas que Usam Paginação
1. Rota de Usuários Admin (`/api/admin/users`) - ✅
2. Rota de Obtenção de Chats do Usuário (`/api/users/me/chats`) - ✅
3. Rota de Obtenção de Mensagens do Chat (`/api/users/me/chats/{chatId}/messages`) - ✅
4. Rota de Obtenção de Mensagens do Usuário (`/api/users/me/messages`) - ✅

### Rotas que Não Usam Paginação
1. Rota de Stream de IA (`/api/ai/stream`) - ❌
2. Rota de Autenticação (`/api/auth/*`) - ❌
3. Rota de Obtenção de Usuário por ID (`/api/users/{userId}`) - ❌
4. Rota de Obtenção do Usuário Atual (`/api/users/me`) - ❌
5. Rota de Obtenção de Chat por ID (`/api/users/me/chats/{chatId}`) - ❌
6. Rota de Obtenção de Mensagem do Chat por ID (`/api/users/me/chats/{chatId}/messages/{messageId}`) - ❌
7. Rota de Obtenção de Mensagem do Usuário por ID (`/api/users/me/messages/{messageId}`) - ❌

### Schema de Paginação

O projeto usa um schema de paginação comum localizado em `src/api/schemas/pagination.schema.ts`:

```typescript
export const paginationBaseSchema = z.object({
  cursor: z.coerce
    .date({
      error: "O cursor deve ser uma data válida.",
    })
    .optional(),
  limit: z.coerce
    .number({
      error: "O limite deve ser um número válido.",
    })
    .max(30, "O limite máximo é 30.")
    .optional()
    .default(20),
});

export const paginationSchema = paginationBaseSchema.optional().default({
  limit: 20,
  cursor: undefined,
});
```

A maioria das rotas paginadas implementam paginação baseada em cursor com:
- `limit`: Número de registros a recuperar (máximo 30)
- `cursor`: Timestamp para iniciar a partir da próxima página
- Resposta inclui `nextCursor`, `hasNextPage` e `limit` para controles de paginação