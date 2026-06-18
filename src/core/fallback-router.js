import { getAccounts } from './account-manager.js';

/**
 * Fallback Router
 * Construye cadenas de fallback multi-proveedor y multi-cuenta.
 */

export function buildFallbackChain(agentId, primaryModel, primarySource, accounts, strategy = 'on-error') {
  const fallbacks = [];
  
  // Encontrar la cuenta principal seleccionada
  const sourcePrefix = primarySource.split('/')[0];
  const providerAccounts = accounts[sourcePrefix] || [];
  
  // Estrategia: Rotar cuentas del MISMO proveedor primero
  if (providerAccounts.length > 1) {
    for (const acc of providerAccounts) {
      if (acc.id !== primarySource) {
        fallbacks.push(`${acc.id}/${primaryModel}`);
      }
    }
  }
  
  // Agregar OpenRouter como safety net si está disponible
  if (accounts['openrouter']) {
    fallbacks.push(`openrouter/${primaryModel}`);
  }
  
  return fallbacks;
}

export function autoGenerateFallbacks(config) {
  // Lógica para autogenerar fallbacks para cada agente en el config
  // Si no tienen fallbacks definidos, los autogenera basándose en cuentas
  for (const [agentId, agentConfig] of Object.entries(config.agents || {})) {
    if (!agentConfig.fallbacks || agentConfig.fallbacks.length === 0) {
      agentConfig.fallbacks = buildFallbackChain(
        agentId, 
        agentConfig.model, 
        agentConfig.source, 
        config.accounts
      );
    }
  }
  return config;
}
