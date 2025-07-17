# Jhuly AI Website

Bem-vindo ao repositório oficial do Jhuly AI Website, uma aplicação web completa construída com Next.js que permite aos usuários interagir com uma assistente de IA chamada Jhuly. A aplicação possui autenticação de usuários, gerenciamento de conversas e uma interface de chat reativa e moderna.

## Visão Geral

O projeto foi desenvolvido para ser uma plataforma de chat com IA robusta e escalável. Ele utiliza as tecnologias mais recentes do ecossistema React e Next.js, incluindo o App Router para uma arquitetura de renderização híbrida, e o Vercel AI SDK para uma integração perfeita com modelos de linguagem.

### Otimizações

- **Performance Otimizada:** O `ChatContext` foi refatorado para separar o estado das ações, e os componentes do formulário foram memoizados para evitar re-renderizações desnecessárias.

## Stack de Tecnologia

- **Framework:** [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Animações:** [Motion](https://motion.dev)
- **Gerenciamento de Estado:** [Zustand](https://zustand-demo.pmnd.rs/) e [React Context](https://react.dev/learn/passing-data-deeply-with-context)
- **Comunicação com API (Client):** [TanStack Query](https://tanstack.com/query/latest)
- **IA & Chat:** [Vercel AI SDK](https://sdk.vercel.ai/)
- **Autenticação:** [NextAuth.js](https://next-auth.js.org/)
- **Banco de Dados & ORM:** [PostgreSQL](https://www.postgresql.org/) com [Prisma](https://www.prisma.io/)
- **Linting & Formatação:** [ESLint](https://eslint.org/)

---

## Estrutura do Projeto

A seguir, uma descrição detalhada da estrutura de pastas e arquivos do projeto:

```
. (Raiz)
├── .env                # Arquivo para variáveis de ambiente (não versionado)
├── .gitignore          # Arquivos e pastas ignorados pelo Git
├── next.config.ts      # Arquivo de configuração do Next.js
├── package.json        # Dependências e scripts do projeto
├── prisma/             # Configuração do Prisma ORM
│   └── schema.prisma   # Schema do banco de dados
├── public/             # Arquivos estáticos (imagens, fontes, etc.)
│   ├── avatars/
│   ├── banners/
│   ├── cursors/
│   └── stickers/
└── src/                # Código-fonte da aplicação
    ├── app/            # App Router do Next.js
    │   ├── (private)/  # Rotas protegidas que exigem autenticação
    │   │   ├── chat/[chatId]/page.tsx # Página de um chat específico
    │   │   ├── login/page.tsx       # Página de login
    │   │   └── layout.tsx         # Layout para as rotas privadas
    │   ├── (public)/   # Rotas públicas
    │   │   ├── overview/page.tsx  # Página de visão geral (landing page)
    │   │   └── layout.tsx         # Layout para as rotas públicas
    │   ├── api/        # Endpoints da API
    │   │   ├── auth/[...nextauth]/route.ts # Rota de autenticação do NextAuth
    │   │   └── chat/route.ts             # Rota da API para o chat com a IA
    │   ├── globals.css # Estilos globais
    │   └── favicon.ico # Ícone da aplicação
    ├── components/     # Componentes React
    │   └── csr/        # Componentes Client-Side (renderizados no navegador)
    │       ├── AsideMenu/    # Componentes do menu lateral
    │       ├── ChatBalloon/  # Balões de mensagem do chat
    │       ├── ChatMessages/ # Container das mensagens do chat
    │       ├── MessagesContainer/ # Container principal da área de mensagens
    │       ├── PromptForm/   # Formulário de envio de prompts
    │       ├── Button.tsx
    │       ├── ChatNavbar.tsx
    │       ├── HomeNavbar.tsx
    │       └── ... (outros componentes de UI)
    ├── contexts/         # Contextos React para gerenciamento de estado global
    │   └── ChatContext.tsx # Contexto que gerencia o estado do chat
    ├── hooks/            # Hooks customizados
    │   ├── useChatMessages.ts # Hook para buscar mensagens de um chat
    │   ├── useChatState.ts    # Hook para obter o estado do chat da URL
    │   └── useWindowSize.ts   # Hook para monitorar o tamanho da janela
    ├── lib/              # Bibliotecas e clientes de serviços externos
    │   ├── nextAuth/     # Configuração do NextAuth
    │   ├── openrouter/   # Cliente para a API do OpenRouter (se aplicável)
    │   └── prisma/       # Cliente Prisma para acesso ao banco de dados
    ├── store/            # Lojas de estado com Zustand
    │   └── asideMenu.ts  # Estado do menu lateral (aberto/fechado)
    └── utils/            # Funções utilitárias
        ├── convertMessageOfDbToAiModel.ts # Converte mensagens do DB para o formato do AI SDK
        └── generateChatNameWithAi.ts      # Gera um nome para o chat usando IA
```

### Descrição Detalhada

- **`prisma/schema.prisma`**: Define o modelo de dados da aplicação. Inclui os modelos `User`, `Account`, `Session`, `VerificationToken` (padrão do NextAuth) e `Chat` e `Message` para a funcionalidade de chat.
- **`src/app/api/...`**: Contém a lógica do backend. A rota `chat` lida com o streaming de respostas da IA, enquanto a rota `auth` gerencia a autenticação de usuários.
- **`src/app/(private)` e `src/app/(public)`**: O uso de _Route Groups_ (`(private)` e `(public)`) permite organizar as rotas e aplicar layouts diferentes para seções da aplicação que são públicas ou que exigem login, sem afetar a URL final.
- **`src/contexts/ChatContext.tsx`**: Componente crucial que utiliza o padrão _Lifting State Up_. Ele mantém o estado do `useChat` (conexão com o stream, mensagens) em um nível superior na árvore de componentes (no layout), evitando que o estado seja perdido durante a navegação entre as páginas de chat.
- **`src/components/Providers.tsx`**: Um componente wrapper que é um Client Component (`"use client"`). Ele é essencial para inicializar providers que dependem de estado do lado do cliente, como `QueryClientProvider` e `ChatProvider`, resolvendo problemas de renderização entre Server e Client Components no Next.js App Router.

---

## Rotas da API

- **`POST /api/chat`**: Endpoint principal para a funcionalidade de chat. Ele recebe o prompt do usuário, interage com o modelo de IA através do Vercel AI SDK e retorna a resposta como um stream de texto. Se for um novo chat, ele cria a entrada no banco de dados e retorna o `chatId` no header `X-Chat-Id`.
- **`GET /api/auth/[...nextauth]`**: Rotas gerenciadas pelo NextAuth para login, logout, gerenciamento de sessão, etc. (ex: `/api/auth/signin`, `/api/auth/signout`, `/api/auth/session`).

---

## Modelo de Dados (`schema.prisma`)

- **`User`**: Armazena informações básicas do usuário (nome, email, imagem).
- **`Chat`**: Representa uma conversa. Possui um relacionamento com `User` e `Message`.
- **`Message`**: Armazena uma única mensagem dentro de um `Chat`, indicando quem a enviou (`user` ou `assistant`).

---

## Como Começar

Siga as instruções abaixo para configurar e rodar o projeto em seu ambiente de desenvolvimento local.

### Pré-requisitos

- [Node.js](https://nodejs.org/en) (versão 18 ou superior)
- [pnpm](https://pnpm.io/) (ou `npm`/`yarn`)
- Uma instância de banco de dados PostgreSQL.

### Instalação

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/d3veduardo/JhulyAiWebsite.git
    cd JhulyAiWebsite
    ```

2.  **Instale as dependências:**

    ```bash
    pnpm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    - Copie o arquivo `.env.example` para um novo arquivo chamado `.env`.
    - Preencha as variáveis de ambiente no arquivo `.env`, incluindo a `DATABASE_URL`, as chaves do provedor de autenticação (ex: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`) e a `NEXTAUTH_SECRET`.

4.  **Execute as Migrações do Banco de Dados:**
    - Aplique o schema do Prisma ao seu banco de dados.

    ```bash
    npx prisma db push
    ```

5.  **Rode o Servidor de Desenvolvimento:**

    ```bash
    pnpm run dev
    ```

    A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

---

## Scripts Disponíveis

- **`pnpm run dev`**: Inicia o servidor de desenvolvimento.
- **`pnpm run build`**: Compila a aplicação para produção.
- **`pnpm run start`**: Inicia um servidor de produção (requer `build` prévio).
- **`pnpm run lint`**: Executa o linter para verificar a qualidade do código.
- **`pnpm run format`**: Formata o código com o Prettier.
