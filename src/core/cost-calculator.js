import { promises as fs } from 'fs';
import path from 'path';

let modelsCatalog = null;

async function loadModels() {
  if (!modelsCatalog) {
    try {
      const data = await fs.readFile(path.join(process.cwd(), 'src/data/models-catalog.json'), 'utf-8');
      modelsCatalog = JSON.parse(data);
    } catch (e) {
      modelsCatalog = { models: [] };
    }
  }
  return modelsCatalog;
}

export async function calculateMonthlyCost(projectConfig) {
  let cost = 0;
  // Suscripciones fijas
  if (projectConfig.providers.includes('opencode-go')) {
    const numAccounts = (projectConfig.accounts['opencode-go'] || []).length;
    cost += 10 * Math.max(1, numAccounts);
  }
  
  // APIs estimadas (uso variable)
  if (projectConfig.providers.includes('openrouter')) cost += 3.30;
  if (projectConfig.providers.includes('xiaomi')) cost += 1.20;
  
  return cost;
}

export async function estimateRateLimitUsage(projectConfig) {
  // Retorna datos mockeados para el UI, calculados según cuentas
  const ocgAccounts = (projectConfig.accounts['opencode-go'] || []).length || 1;
  
  return {
    'kimi-k2.6': { limit: 1150 * ocgAccounts, used: 658, percent: (658 / (1150 * ocgAccounts)) * 100 },
    'deepseek-v4-pro': { limit: 3300 * ocgAccounts, used: 412, percent: (412 / (3300 * ocgAccounts)) * 100 },
    'budget': { limit: 12 * ocgAccounts, used: 7.20, percent: (7.20 / (12 * ocgAccounts)) * 100 }
  };
}
