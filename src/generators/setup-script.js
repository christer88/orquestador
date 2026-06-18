export async function generateUbuntu(projectConfig) {
  return `#!/bin/bash
# === ORQUESTADOR VIBECODING — VM SETUP (Ubuntu) ===
set -e

echo "🚀 Instalando entorno VibeCoding..."

# 1. Configurar directorios locales para evitar requerir sudo
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

# 2. Definir rutas en el PATH de la sesión actual
export PATH=$PATH:$HOME/.npm-global/bin:$HOME/.go/bin:$HOME/.bun/bin:$HOME/.opencode/bin

# Agregar al .bashrc para persistencia si no están ya
if ! grep -q "npm-global" ~/.bashrc; then
  echo 'export PATH=$PATH:$HOME/.npm-global/bin:$HOME/.go/bin:$HOME/.bun/bin:$HOME/.opencode/bin' >> ~/.bashrc
  echo "✅ Rutas agregadas a ~/.bashrc para persistencia"
fi

# 3. Prerequisitos
# Intentar instalar herramientas de sistema usando sudo -n (no interactivo) por si acaso, sin fallar si requiere clave
sudo -n apt update && sudo -n apt install -y curl git build-essential || echo "⚠️  No se pudo usar apt con sudo (se asume que curl, git ya existen)"

command -v node || { echo "❌ Node.js no está instalado y no hay sudo para instalarlo. Instálalo primero."; exit 1; }

# Instalar Go localmente
if ! command -v go &> /dev/null; then
  echo "📥 Instalando Go localmente en ~/.go ..."
  wget -q https://go.dev/dl/go1.22.5.linux-amd64.tar.gz
  mkdir -p ~/.go
  tar -xzf go1.22.5.linux-amd64.tar.gz -C ~/.go --strip-components=1
  rm go1.22.5.linux-amd64.tar.gz
  echo "✅ Go instalado"
fi

# Instalar Bun localmente
if ! command -v bun &> /dev/null; then
  echo "📥 Instalando Bun localmente..."
  curl -fsSL https://bun.sh/install | bash
  echo "✅ Bun instalado"
fi

# 4. Herramientas de VibeCoding
echo "📥 Instalando OpenCode CLI..."
curl -fsSL https://opencode.ai/install | bash

echo "📥 Instalando command-code localmente..."
npm i -g command-code

echo "📥 Inicializando oh-my-opencode..."
# Asegurarnos de que bun está en PATH para bunx
export PATH=$PATH:$HOME/.bun/bin
bunx oh-my-opencode install --no-tui --claude=no --gemini=no --copilot=no --opencode-go=yes

# 5. Configs
echo "⚙️  Configurando archivos del proyecto..."
mkdir -p ~/.config/opencode
rm -f ~/.config/opencode/opencode.json
cp opencode.jsonc ~/.config/opencode/opencode.jsonc
cp oh-my-openagent.json ~/.config/opencode/oh-my-openagent.json

# 6. Variables de entorno
if [ -f .env ]; then
  cp .env ~/.config/opencode/.env
  set -a && source .env && set +a
  echo "✅ Variables de entorno cargadas"
else
  echo "⚠️  No se encontró .env — crea uno con tus API keys"
fi

# 7. Auth (se omiten comandos interactivos bloqueantes en despliegue automático, pero se listan para el usuario)
echo "🔒 Nota: Ejecuta 'opencode auth login' y 'cmd login' si necesitas autenticarte manualmente."

# 8. Verificar
echo ""
echo "=== VERIFICACIÓN ==="
opencode --version || echo "opencode no disponible en PATH actual"
bunx oh-my-opencode doctor --verbose || echo "doctor falló"
opencode models || echo "no se pudieron listar modelos de opencode"
echo ""
echo "✅ Setup completo! Tu entorno está listo."
echo "📖 Lee AGENTS-README.md para entender cada agente."
`;
}

export async function generateDebian(projectConfig) {
  const ubuntuScript = await generateUbuntu(projectConfig);
  return ubuntuScript.replace('(Ubuntu)', '(Debian)');
}
