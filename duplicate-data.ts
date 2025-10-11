import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TARGET_CHAT_ID = "0413cc5c-bfe1-4e24-9d26-68c7488b337b";
const DUPLICATIONS = 50;
const TIME_INCREMENT_SECONDS = 2;
const BATCH_SIZE = 10; // Processar mensagens em lotes

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function duplicateData() {
  try {
    console.log("🚀 Iniciando duplicação de mensagens...");
    console.log(`🎯 Chat alvo: ${TARGET_CHAT_ID}`);

    // Buscar o chat específico
    const targetChat = await prisma.chat.findUnique({
      where: { id: TARGET_CHAT_ID },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!targetChat) {
      console.log("❌ Chat não encontrado!");
      return;
    }

    if (targetChat.messages.length === 0) {
      console.log("❌ O chat não possui mensagens para duplicar.");
      return;
    }

    console.log(`📊 Chat encontrado: "${targetChat.name}"`);
    console.log(
      `📊 Total de mensagens originais: ${targetChat.messages.length}`
    );
    console.log(
      `📊 Serão criadas ${targetChat.messages.length * DUPLICATIONS} novas mensagens\n`
    );

    const startTime = Date.now();
    let totalCreated = 0;

    // Para cada duplicação
    for (let i = 1; i <= DUPLICATIONS; i++) {
      console.log(`📋 Duplicação ${i}/${DUPLICATIONS}...`);

      const timeOffset = i * TIME_INCREMENT_SECONDS * 1000; // em milissegundos

      // Processar mensagens em lotes para evitar sobrecarga
      for (let j = 0; j < targetChat.messages.length; j += BATCH_SIZE) {
        const batch = targetChat.messages.slice(j, j + BATCH_SIZE);

        // Criar mensagens do lote em paralelo usando createMany
        const messagesToCreate = batch.map((originalMessage) => {
          const newMessageCreatedAt = new Date(
            originalMessage.createdAt.getTime() + timeOffset
          );
          const newMessageUpdatedAt = new Date(
            originalMessage.updatedAt.getTime() + timeOffset
          );

          return {
            senderId: originalMessage.senderId,
            role: originalMessage.role,
            reasoning: originalMessage.reasoning,
            content: originalMessage.content,
            chatId: TARGET_CHAT_ID,
            createdAt: newMessageCreatedAt,
            updatedAt: newMessageUpdatedAt,
          };
        });

        // Usar createMany para inserção em batch (mais eficiente)
        await prisma.message.createMany({
          data: messagesToCreate,
        });

        totalCreated += messagesToCreate.length;

        // Pequena pausa entre lotes para evitar rate limit
        await sleep(50);
      }

      console.log(`  ✅ ${targetChat.messages.length} mensagens criadas`);

      // Pausa maior a cada 10 duplicações
      if (i % 10 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(
          `\n⏸️  Checkpoint: ${i} duplicações | ${totalCreated} mensagens criadas | ${elapsed}s decorridos`
        );
        await sleep(500);
      }
    }

    // Atualizar o updatedAt do chat
    await prisma.chat.update({
      where: { id: TARGET_CHAT_ID },
      data: { updatedAt: new Date() },
    });

    // Estatísticas finais
    const finalMessageCount = await prisma.message.count({
      where: { chatId: TARGET_CHAT_ID },
    });

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log("\n✨ Duplicação concluída com sucesso!");
    console.log(`📈 Total de mensagens no chat: ${finalMessageCount}`);
    console.log(`📈 Mensagens criadas: ${totalCreated}`);
    console.log(`⏱️  Tempo total: ${totalTime}s`);
    console.log(
      `⚡ Taxa: ${(totalCreated / parseFloat(totalTime)).toFixed(1)} mensagens/segundo`
    );
  } catch (error) {
    console.error("❌ Erro durante a duplicação:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
duplicateData()
  .then(() => {
    console.log("\n🎉 Script finalizado!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Erro fatal:", error);
    process.exit(1);
  });
