# 🚀 Orquestador VibeCoding

Este orquestador es una aplicación local con interfaz web (SPA) que te permite diseñar, gestionar y generar configuraciones complejas para agentes de Inteligencia Artificial como **OpenCode Go**, **CommandCode AI**, **Xiaomi MiMo** y **Oh My OpenAgent**. 

Genera todas tus `.env`, scripts de instalación y ruteos (Prompt Caching, Fallbacks Multi-Proveedor) de forma automática.

---

## 📖 Índice
1. [Subir este proyecto a GitHub](#1-subir-este-proyecto-a-github)
2. [Instalar el Orquestador en tu VM (Linux)](#2-instalar-el-orquestador-en-tu-vm-linux)
3. [Cómo utilizar la Interfaz Web](#3-cómo-utilizar-la-interfaz-web)
4. [Flujo de Trabajo (VibeCoding)](#4-flujo-de-trabajo-vibecoding)

---

## 1. Subir este proyecto a GitHub

Dado que tienes esta carpeta en tu disco local (o Google Drive), el primer paso es subirlo a un repositorio privado en GitHub para que puedas clonarlo fácilmente en cualquier servidor Linux.

1. Ve a [GitHub.com](https://github.com/) y crea un nuevo repositorio llamado `orquestador-vibecoding` (hazlo **Privado** si contiene datos sensibles, aunque el archivo `.gitignore` ya excluye los archivos `.env`).
2. Abre tu terminal (PowerShell, Bash, o Git Bash) en la carpeta de este proyecto (`g:\Mi unidad\ANTIGRAVITY - PROYECTOS\ORQUESTADOR`).
3. Ejecuta los siguientes comandos:
   ```bash
   git init
   git add .
   git commit -m "Versión 1.0: Orquestador Inicial"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/orquestador-vibecoding.git
   git push -u origin main
   ```
   *(Asegúrate de cambiar `TU_USUARIO` por tu nombre de usuario real en GitHub).*

---

## 2. Instalar el Orquestador en tu VM (Linux)

Cuando levantes una nueva Máquina Virtual (Ubuntu o Debian), sigue estos pasos para instalar y ejecutar el Orquestador:

### Paso A: Clonar el Repositorio
Ingresa a tu máquina virtual por SSH y clona tu repositorio:
```bash
# Actualiza los repositorios de Linux
sudo apt update && sudo apt install -y git curl

# Clona tu proyecto (te pedirá tu token de GitHub si es privado)
git clone https://github.com/TU_USUARIO/orquestador-vibecoding.git
cd orquestador-vibecoding
```

### Paso B: Instalar Node.js
El Orquestador necesita Node.js versión 20+. Si tu Linux es nuevo, instálalo con:
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs
```

### Paso C: Iniciar el Servidor
Instala las dependencias y corre el Orquestador:
```bash
# Instalar dependencias del package.json
npm install

# Levantar el servidor
npm run dev
```
Verás en la consola que el servidor está escuchando en el puerto `3847`. Si estás en una VM remota y quieres ver la interfaz en tu computadora local, asegúrate de habilitar el puerto `3847` en el firewall de tu proveedor (AWS, Google Cloud, etc.) o haz un túnel SSH.

---

## 3. Cómo utilizar la Interfaz Web

Una vez que el servidor esté corriendo, abre tu navegador y visita `http://localhost:3847` (o la IP de tu VM: `http://TU_IP:3847`).

### 🛠️ Paso a Paso para Generar Configuraciones:
1. **Dashboard Inicial**: Verás la lista de tus proyectos. Haz clic en el botón azul **"✨ Nuevo Proyecto"**.
2. **Wizard de Configuración**:
   - Asigna un nombre a tu proyecto.
   - Selecciona la plantilla base (por ejemplo, "Mi Setup Actual" para usar OpenCode, CommandCode y Xiaomi).
   - **IMPORTANTE**: Activa el toggle de **"Modo Cache-Friendly"** si el proyecto será intensivo. Esto evitará "Cache Misses" en el proveedor de la API y ahorrará consumo de tokens.
3. **Generar**: Presiona "Generar Configuraciones 🚀". Serás redirigido al Dashboard.
4. **Descargar**: En la tarjeta de tu proyecto recién creado, presiona **"Descargar ZIP"**.

### ¿Qué hay dentro del archivo ZIP?
- `oh-my-openagent.json`: Listo para ser detectado por OmO.
- `opencode.json`: Incluye los fallbacks y tu configuración de proxy.
- `.env`: Contiene todas las variables vacías mapeadas (ej. `COMMANDCODE_1_API_KEY=...`) y el `PROJECT_CACHE_ID`.
- `setup-ubuntu.sh`: El script bash para levantar tu entorno VibeCoding e instalar las herramientas cli como `opencode`, `command-code` y `opencode-context-cache`.
- `AGENTS-README.md`: Tu guía de referencia de agentes para saber qué rol y modelo tiene asignado cada uno en tu proyecto.

---

## 4. Flujo de Trabajo (VibeCoding)

Una vez que descargues tu `.zip` del Orquestador a la carpeta de trabajo de tu nuevo proyecto:
1. Extrae los archivos.
2. Abre el archivo `.env` y pega tus API Keys reales de CommandCode, OpenCode, Xiaomi y OpenRouter.
3. Ejecuta el script de preparación autogenerado:
   ```bash
   bash setup-ubuntu.sh
   ```
4. ¡Listo! Ya puedes empezar a programar lanzando a tus agentes:
   ```bash
   bunx oh-my-opencode
   ```
   *(Si el límite de CommandCode se agota, recuerda que puedes rotar tu llave usando `COMMANDCODE_API_KEY=$COMMANDCODE_2_API_KEY cmd` gracias a la exportación de tu .env).*
