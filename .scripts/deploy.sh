#!/bin/bash
set -e

# Nome do zip final
ZIP_NAME="deploy.zip"

echo "🚀 Iniciando build do Next.js..."
pnpm build

echo "📦 Criando arquivo zip..."
# Remove zip antigo se existir
[ -f $ZIP_NAME ] && rm $ZIP_NAME

# Adiciona os arquivos necessários
zip -r $ZIP_NAME \
  .next \
  public \
  package.json \
  pnpm-lock.yaml \
  .certs \
  prisma \
  .env* \
  -x "node_modules/*" \
  -x "deploy-temp/*"

echo "✅ Deploy zip criado: $ZIP_NAME"
echo ""
echo "💡 Para rodar na host:"
echo "1. Instale as dependências de produção: pnpm install --prod"
echo "2. Inicie o app: pnpm start"
echo ""
echo "📝 Se precisar de portas diferentes, use: PORT=3000 pnpm start"
