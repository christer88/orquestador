#!/bin/bash
# === ORQUESTADOR VIBECODING — VM SETUP (Ubuntu) ===
set -e

echo "🚀 Instalando entorno VibeCoding..."

# 1. Prerequisitos
sudo apt update && sudo apt install -y curl git build-essential
command -v node || { curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash - && sudo apt install -y nodejs; }
command -v go || { wget -q https://go.dev/dl/go1.24.linux-amd64.tar.gz && sudo tar -C /usr/local -xzf go*.tar.gz && rm go*.tar.gz; }
export PATH=$PATH:/usr/local/go/bin
command -v bun || { curl -fsSL https://bun.sh/install | bash; }

# 2. Herramientas de VibeCoding
curl -fsSL https://opencode.ai/install | bash
npm i -g command-code opencode-context-cache
bunx oh-my-opencode install --no-tui --opencode-go=yes

# 3. Configs
mkdir -p ~/.config/opencode
cp opencode.json ~/.config/opencode/opencode.json
cp oh-my-openagent.json ~/.config/opencode/oh-my-openagent.json

# 4. Variables de entorno
if [ -f .env ]; then
  cp .env ~/.config/opencode/.env
  set -a && source .env && set +a
  echo "✅ Variables de entorno cargadas"
else
  echo "⚠️  No se encontró .env — crea uno con tus API keys"
fi

# 5. Auth
opencode auth login
cmd login

# 6. Verificar
echo ""
echo "=== VERIFICACIÓN ==="
opencode --version
bunx oh-my-opencode doctor --verbose
opencode models
echo ""
echo "✅ Setup completo! Tu entorno está listo."
echo "📖 Lee AGENTS-README.md para entender cada agente."
