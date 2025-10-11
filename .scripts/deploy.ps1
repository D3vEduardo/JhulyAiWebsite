# Evita que o script pare no primeiro erro
$ErrorActionPreference = "Stop"

# Vai para a raiz do projeto (considerando que o script está em .scripts/)
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $root\..

$zipName = "deploy.zip"

Write-Host "🚀 Iniciando build do Next.js..."
pnpm build

Write-Host "📦 Criando arquivo zip..."

# Remove zip antigo se existir
if (Test-Path $zipName) { Remove-Item $zipName }

# Lista de arquivos e pastas essenciais
$include = @(
    ".next",
    "public",
    ".certs",
    "prisma",
    "package.json",
    "pnpm-lock.yaml",
    "next.config.ts",
    "tsconfig.json"  # opcional, se usar TypeScript
)

# Cria o zip apenas com os arquivos/pastas especificados
Compress-Archive -Path $include -DestinationPath $zipName -Force

Write-Host "✅ Deploy zip criado: $zipName"
Write-Host ""
Write-Host "💡 Para rodar na host:"
Write-Host "1. Instale as dependências de produção: pnpm install --prod"
Write-Host "2. Inicie o app: pnpm start"
Write-Host ""
Write-Host "📝 Se precisar de porta diferente: PORT=3000 pnpm start"
