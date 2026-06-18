/**
 * Account Manager para Orquestador VibeCoding
 * Gestiona múltiples cuentas (ej. opencode-go-1, opencode-go-2) por proveedor.
 */

export function getAccounts(projectConfig, providerId) {
  if (!projectConfig.accounts || !projectConfig.accounts[providerId]) {
    return [];
  }
  return projectConfig.accounts[providerId];
}

export function getActiveAccount(projectConfig, providerId) {
  const accounts = getAccounts(projectConfig, providerId);
  return accounts.find(a => a.active !== false) || accounts[0] || null;
}

export function addAccount(projectConfig, providerId, label) {
  if (!projectConfig.accounts) projectConfig.accounts = {};
  if (!projectConfig.accounts[providerId]) projectConfig.accounts[providerId] = [];
  
  const count = projectConfig.accounts[providerId].length + 1;
  const id = `${providerId}-${count}`;
  const envKey = `${providerId.toUpperCase().replace(/-/g, '_')}_${count}_API_KEY`;
  
  const account = {
    id,
    label: label || `Cuenta ${count}`,
    envKey,
    active: true
  };
  
  projectConfig.accounts[providerId].push(account);
  return projectConfig;
}

export function generateEnvKeys(projectConfig) {
  const keys = [];
  if (!projectConfig.accounts) return keys;
  
  for (const [providerId, accounts] of Object.entries(projectConfig.accounts)) {
    for (const account of accounts) {
      keys.push(account.envKey);
    }
  }
  return keys;
}

export function switchAccount(projectConfig, providerId, accountId) {
  const accounts = getAccounts(projectConfig, providerId);
  accounts.forEach(a => {
    a.active = (a.id === accountId);
  });
  return projectConfig;
}
