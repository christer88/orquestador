export async function generate(projectConfig) {
  let env = `# === ORQUESTADOR VIBECODING — API KEYS ===\n\n`;

  for (const providerId of projectConfig.providers || []) {
    const accounts = projectConfig.accounts?.[providerId] || [{ id: providerId, label: 'Default' }];
    
    env += `# Provider: ${providerId}\n`;
    for (const acc of accounts) {
      const envKey = acc.envKey || `${acc.id.toUpperCase().replace(/-/g, '_')}_API_KEY`;
      const realValue = process.env[envKey] || 'tu_key_aqui';
      env += `# ${acc.label}\n`;
      env += `${envKey}=${realValue}\n`;
    }
    env += `\n`;
  }

  if (projectConfig.cacheOptimization) {
    env += `# === CONFIGURACIÓN DE CACHÉ ===\n`;
    env += `PROJECT_CACHE_ID=${projectConfig.id || 'sesion_' + Date.now()}\n\n`;
  }

  return env;
}
