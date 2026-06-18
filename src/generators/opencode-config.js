export async function generate(projectConfig) {
  const config = {
    $schema: "https://opencode.ai/config.json",
    model: "deepseek-v4-flash", // Modelo default barato
    providers: {},
    theme: "opencode",
    autoupdate: true
  };

  // Iterar por todos los proveedores y cuentas configuradas
  for (const providerId of projectConfig.providers || []) {
    const accounts = projectConfig.accounts?.[providerId] || [{ id: providerId }];
    
    for (const acc of accounts) {
      let providerConfig = {};
      
      // Mapear ENV variable según el generador de ENV
      const envKey = acc.envKey || `${acc.id.toUpperCase().replace(/-/g, '_')}_API_KEY`;
      providerConfig.apiKey = `{env:${envKey}}`;

      if (providerId === 'openrouter') {
        providerConfig.baseURL = "https://openrouter.ai/api/v1";
      } else if (providerId === 'deepseek-api') {
        providerConfig.baseURL = "https://api.deepseek.com";
      } else if (providerId === 'moonshot') {
        providerConfig.baseURL = "https://api.moonshot.ai/v1";
      }
      
      if (projectConfig.cacheOptimization) {
        providerConfig.options = {
          setCacheKey: true,
          headers: {
            "x-session-id": "{env:PROJECT_CACHE_ID}"
          }
        };
      }
      
      config.providers[acc.id] = providerConfig;
    }
  }

  return JSON.stringify(config, null, 2);
}
