import fs from 'node:fs/promises';
import { generateAllConfigs } from './src/core/config-engine.js';
import path from 'node:path';

const dummyProject = {
  id: "ejemplo-123",
  name: "Mi Entorno VibeCoding (Ejemplo)",
  description: "Proyecto de prueba con modo caché activado y dos cuentas",
  cacheOptimization: true,
  providers: ['opencode-go', 'commandcode'],
  accounts: {
    'opencode-go': [{ id: 'opencode-go-1', label: 'Cuenta OpenCode Principal', envKey: 'OPENCODE_GO_1_AUTH' }],
    'commandcode': [{ id: 'commandcode-1', label: 'Cuenta CommandCode Principal', envKey: 'COMMANDCODE_1_API_KEY' }]
  },
  agents: {
    "sisyphus": { 
      "name": "Sisyphus",
      "role": "Orquestador Principal",
      "description": "El jefe de operaciones para tareas de programación complejas.",
      "model": "kimi-k2.6", 
      "source": "opencode-go-1", 
      "fallbacks": ["commandcode-1/kimi-k2.6"] 
    },
    "librarian": { 
      "name": "Librarian",
      "role": "Buscador de Código",
      "description": "Explora el repositorio y encuentra funciones a la velocidad de la luz.",
      "model": "deepseek-v4-flash", 
      "source": "opencode-go-1", 
      "fallbacks": [] 
    }
  }
};

async function run() {
  try {
    const generados = await generateAllConfigs(dummyProject);
    const outDir = path.join(process.cwd(), 'ejemplo-orquestador');
    
    // Crear directorio de ejemplo
    try {
      await fs.mkdir(outDir, { recursive: true });
    } catch(e) {}
    
    // Escribir archivos
    for (const [nombre, contenido] of Object.entries(generados)) {
      if (nombre.startsWith('_')) continue;
      const contenidoStr = typeof contenido === 'string' ? contenido : JSON.stringify(contenido, null, 2);
      await fs.writeFile(path.join(outDir, nombre), contenidoStr, 'utf-8');
    }
    
    // Escribir el origen
    await fs.writeFile(path.join(outDir, 'project.json'), JSON.stringify(dummyProject, null, 2), 'utf-8');
    
    console.log('✅ Archivos generados con éxito en la carpeta: /ejemplo-orquestador/');
  } catch (error) {
    console.error('❌ Error generando ejemplo:', error);
  }
}

run();
