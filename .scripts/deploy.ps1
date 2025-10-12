# Evita que o script pare no primeiro erro
$ErrorActionPreference = "Stop"

# Vai para a raiz do projeto
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location "$root\.."

$deployDir = ".deploy"
$nextDir = ".next"
$appId = $env:SQUARECLOUD_APP_ID
$nodeEnv = $env:NODE_ENV
if (-not $nodeEnv) { $nodeEnv = "production" }

# Remove builds antigos
Write-Host "🧹 Limpando builds antigos..."
if (Test-Path $nextDir) {
    Remove-Item -Recurse -Force $nextDir
    Write-Host "✅ Diretório $nextDir removido"
}
if (Test-Path $deployDir) {
    Remove-Item -Recurse -Force $deployDir
    Write-Host "✅ Diretório $deployDir removido"
}

# Escolhe o arquivo de ambiente
if ($nodeEnv -eq "production") {
    $envFile = ".env.production"
} else {
    $envFile = ".env.development"
}

if (-not (Test-Path $envFile)) {
    Write-Host "❌ ERRO: Arquivo de ambiente '$envFile' não encontrado!"
    exit 1
}

Write-Host "🌍 Ambiente detectado: $nodeEnv"
Write-Host "📄 Usando arquivo de env: $envFile"

if (-not $appId) {
    Write-Host "❌ ERRO: Variável de ambiente SQUARECLOUD_APP_ID não foi definida."
    exit 1
}

# Build Next.js (ele vai automaticamente usar .env.production se NODE_ENV=production)
Write-Host "🏗️ Executando build do Next.js..."
pnpm build

# Cria pasta de deploy
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Itens que vão para o deploy (sem o envFile)
$include = @(
    ".next",
    "public",
    ".certs",
    "prisma",
    "package.json",
    "pnpm-lock.yaml",
    "next.config.ts",
    "tsconfig.json"
)

Write-Host "📦 Copiando arquivos para $deployDir..."
foreach ($item in $include) {
    if (Test-Path $item) {
        Copy-Item -Recurse -Force $item -Destination $deployDir
    } else {
        Write-Host "⚠️ Aviso: '$item' não encontrado, ignorando..."
    }
}

# Deploy automático para Square Cloud
Write-Host "🚀 Enviando commit para Square Cloud..."
Set-Location $deployDir
squarecloud app commit $appId -r

Write-Host "✅ Deploy finalizado com sucesso!"

cd ..