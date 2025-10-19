# Investigação: Problema de Scroll Y e Compressão de Balões no ChatMessages

## Problema Identificado

O componente `@src/components/ChatMessages/ChatMessages.tsx` apresenta dois problemas relacionados:

1. O scroll no eixo Y não está funcionando corretamente
2. Os balões de mensagem (baloons) estão se comprimindo em altura à medida que novas mensagens são adicionadas
3. As mensagens eventualmente ficam invisíveis devido à redução extrema de altura

## Análise do Componente ChatMessages

### Estrutura Atual
```tsx
<motion.main
  className="w-full h-[calc(100%-7vh)] pt-2 overflow-y-auto overflow-x-hidden pb-[175px] flex flex-col"
  id="chatMessages"
>
```

O componente principal tem as seguintes propriedades:
- Altura fixa: `h-[calc(100%-7vh)]`
- Overflow Y: `overflow-y-auto` (deveria permitir scroll)
- Overflow X: `overflow-x-hidden`
- Padding inferior: `pb-[175px]`
- Layout flex com coluna: `flex flex-col`

### Problemas Identificados

#### 1. Classe `overflow-y-hidden` nos Balões Individuais

**Localização:** Linha 34 no container de cada mensagem
```tsx
<motion.div
  layout={
    status === "streaming" && messageIndex === messages.length - 1
      ? false
      : "position"
  }
  className="mb-2 h-auto w-full overflow-y-hidden"
  key={`${message.id}_${messageIndex}_${message.role}`}
>
```

A classe `overflow-y-hidden` está definida para cada balão individual, o que pode causar:
- Cortes no conteúdo das mensagens
- Problemas de layout quando múltiplas mensagens são renderizadas
- Interferência com o cálculo automático de altura

#### 2. Uso do layout animation do Framer Motion

O atributo `layout` do Framer Motion está configurado para:
- `"position"` para mensagens existentes
- `false` para a última mensagem durante streaming

Essa configuração pode causar:
- Re-renderizações excessivas dos componentes
- Problemas de cálculo de altura durante animações
- Conflitos com o comportamento de scroll natural

#### 3. Problemas de Auto-scroll

No contexto `ChatContext/Provider.tsx`, há uma funcionalidade de scroll automático:

```tsx
useEffect(() => {
  const chatContainer = document.getElementById("chatMessages");
  if (
    chatContainer &&
    chat.status !== "streaming" &&
    chat.messages.length > 0
  ) {
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  }
}, [chat.messages, chat.status]);
```

Esse comportamento de scroll automático combinado com animações pode causar:
- Competição entre scroll manual do usuário e scroll automático
- Problemas de desempenho com reflows frequentes
- Interferência na renderização adequada das mensagens

#### 4. Interferência do Accordion de Reasoning

```tsx
{message.parts?.find((part) => part.type === "reasoning")
  ?.text && (
  <div className="mb-2 w-full ml-auto mr-auto">
    <Accordion
      title="Reasoning"
      content={
        message.parts.find((part) => part.type === "reasoning")
          ?.text
      }
    />
  </div>
)}
```

O Accordion de reasoning adiciona elementos dinâmicos que podem afetar:
- O cálculo de altura das mensagens
- O layout geral da conversa
- A previsibilidade do scroll

## Análise do Componente ChatBalloon

### Estrutura Atual
```tsx
<figure className={variants(selectedVariant)}>
  <Markdown rehypePlugins={[rehypeHighlight]} remarkPlugins={[remarkGfm]}>
    {message.content}
  </Markdown>
</figure>
```

### Problemas Identificados

1. O componente usa uma tag `<figure>` que pode ter estilos padrão que afetam altura
2. O conteúdo é processado via Markdown, o que pode resultar em variações de altura imprevisíveis
3. O memoization é baseado apenas em `id` e `content`, mas não leva em conta alterações de altura ou layout

## Análise Detalhada da Compressão dos Balões

### 1. Efeito Cascata de Múltiplas Submissões

Quando o bug de prompt suggestions estava ativo, múltiplas submissões simultâneas causavam:
- Múltiplas cópias idênticas da mesma mensagem sendo adicionadas rapidamente
- O React tentando reconciliar múltiplos elementos com chaves semelhantes
- O Framer Motion tentando animar múltiplas vezes o mesmo conteúdo
- O mecanismo de layout recalculando constantemente as posições

### 2. Interferência do Layout Animation

O atributo `layout="position"` em cada mensagem está fazendo com que:
- O Framer Motion recalculasse as posições de todos os elementos irmãos a cada nova mensagem
- Alturas e posições sejam constantemente atualizadas, causando instabilidade visual
- O navegador realize reflows frequentes, o que impacta negativamente o desempenho

### 3. Estilo overflow-y-hidden

A classe `overflow-y-hidden` aplicada a cada container de mensagem:
- Impede que o conteúdo excedente seja visível
- Pode causar cálculos incorretos de altura durante animações
- Interfere com o comportamento natural de expansão dos elementos

### 4. Problemas de Scroll e Posicionamento

A combinação de scroll automático com animações de layout:
- Faz com que o scroll vá para o final enquanto animações ainda estão em andamento
- Pode causar deslocamentos inesperados que afetam o cálculo de altura
- Resulta em uma experiência de usuário inconsistente

## Causas Prováveis da Compressão

1. **Layout Animation Interferindo:** As animações de layout do Framer Motion estão recalculando constantemente alturas
2. **Overflow Y Hidden:** A classe `overflow-y-hidden` em cada mensagem está restringindo o conteúdo
3. **Scroll Automático:** O scroll automático está competindo com o layout natural das mensagens
4. **Re-renderização Excessiva:** Múltiplas re-renderizações causando reflows constantes
5. **Mensagens Duplicadas:** O bug anterior de prompt suggestions criou múltiplas instâncias da mesma mensagem
6. **Conflitos de Altura em Animações:** As animações de altura podem estar entrando em conflito com o conteúdo real

## Relação com o Problema de Prompt Suggestions

O problema de duplicação de prompts (já corrigido) também contribuiu para o problema de compressão:
- Múltiplas mensagens idênticas sendo adicionadas rapidamente
- Layout animations sendo acionadas múltiplas vezes para o mesmo conteúdo
- Aumento exponencial de elementos no DOM
- Problemas de reconciliação do React com chaves duplicadas ou conflitantes

## Análise de CSS e Layout

### Classes do Elemento Principal
```tsx
className="w-full h-[calc(100%-7vh)] pt-2 overflow-y-auto overflow-x-hidden pb-[175px] flex flex-col"
```

- `w-full`: Largura total
- `h-[calc(100%-7vh)]`: Altura relativa à viewport com subtração de 7%
- `pt-2`: Padding superior de 0.5rem
- `overflow-y-auto`: Deveria permitir scroll vertical quando necessário
- `overflow-x-hidden`: Esconde overflow horizontal
- `pb-[175px]`: Padding inferior de 175px
- `flex flex-col`: Layout flex em coluna

### Classes dos Containers de Mensagem
```tsx
className="mb-2 h-auto w-full overflow-y-hidden"
```

- `mb-2`: Margin inferior de 0.5rem
- `h-auto`: Altura automática (poderia ser o problema)
- `w-full`: Largura total
- `overflow-y-hidden`: **PROBLEMA CRÍTICO** - Esconde overflow vertical

### Análise do Problema de Scroll

Apesar de `overflow-y-auto` estar definido no elemento principal, os problemas incluem:

1. **Containers com overflow-y-hidden**: Cada mensagem tem `overflow-y-hidden`, o que pode interferir com o scroll do container principal
2. **Altura automática**: `h-auto` permite que os elementos colapsem completamente se o conteúdo interno não for renderizado corretamente
3. **Falta de limite mínimo de altura**: Nenhum valor de altura mínima (`min-h-*`) é especificado

### Interferência do Framer Motion

O `motion.main` e os `motion.div` internos podem interferir com o layout por:
1. Sobrepor estilos CSS com estilos inline durante animações
2. Recalcular dimensões durante transições
3. Interferir com o fluxo normal do layout CSS

## Identificação das Causas do Problema de Altura Reduzida

### 1. Efeito Cumulativo de Múltiplas Animações
- Cada nova mensagem dispara uma animação de layout
- Com mensagens duplicadas, múltiplas animações competem
- Isso pode causar cálculos errôneos de altura

### 2. Problemas de Renderização do Markdown
- O conteúdo das mensagens é renderizado via `react-markdown`
- Em estados intermediários ou com conteúdo vazio, os elementos podem ter altura zero
- As animações podem capturar esses estados e perpetuá-los

### 3. Interferência do Accordion de Reasoning
- O Accordion adiciona elementos dinamicamente
- Pode afetar o cálculo total de altura da mensagem
- Pode causar reflows que afetam o layout das mensagens adjacentes

### 4. Scroll Automático Interferindo
- O scroll automático pode ser acionado durante animações
- Isso pode causar cálculos errôneos de altura total
- Pode resultar em layouts parciais ou incompletos

## Soluções Recomendadas

1. **Remover overflow-y-hidden:** Remover a classe `overflow-y-hidden` dos containers individuais de mensagem
2. **Ajustar animações de layout:** Avaliar se as animações de layout são necessárias para cada mensagem ou usar uma abordagem menos intensiva
3. **Melhorar controle de scroll:** Implementar um sistema de scroll mais robusto que não entre em conflito com animações
4. **Adicionar controles de altura mínima:** Garantir que os balões tenham uma altura mínima para evitar colapso total
5. **Otimizar re-renderizações:** Reduzir re-renderizações desnecessárias que causam reflows constantes
6. **Atualizar estratégia de chaves:** Garantir que as chaves usadas no .map sejam únicas e consistentes mesmo com mensagens duplicadas
7. **Implementar alturas mínimas:** Usar classes como `min-h-[60px]` para garantir que os balões não fiquem invisíveis
8. **Ajustar o comportamento de layout animation:** Avaliar se `layout="position"` é a melhor opção ou se poderia ser mais seletiva

## Conclusão

O problema de scroll e compressão de balões no componente ChatMessages é multifatorial, envolvendo:

1. A combinação de animações de layout do Framer Motion com conteúdo dinâmico
2. Classes CSS inadequadas que restringem visualmente o conteúdo
3. Problemas de sincronização entre scroll automático e animações
4. O bug anterior de duplicação de prompts que exacerbou o problema

A solução requer uma abordagem integral que aborde tanto os problemas de layout quanto os de animação, garantindo uma experiência de usuário fluida e sem os problemas de visualização atuais.

A correção dos bugs identificados restaurará o comportamento adequado de scroll e manterá os balões de mensagem com altura apropriada para legibilidade e usabilidade.