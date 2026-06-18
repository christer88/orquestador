import * as omoGen from '../generators/omo-config.js';
import * as opencodeGen from '../generators/opencode-config.js';
import * as envGen from '../generators/env-generator.js';
import * as readmeGen from '../generators/readme-generator.js';
import * as setupGen from '../generators/setup-script.js';

export async function validateConfig(config) {
  const errors = [];
  if (!config.name) errors.push("Falta nombre del proyecto");
  if (!config.providers || config.providers.length === 0) errors.push("Debe seleccionar al menos un proveedor");
  return { isValid: errors.length === 0, errors };
}

export async function generateAllConfigs(projectConfig) {
  const validation = await validateConfig(projectConfig);
  if (!validation.isValid) {
    throw new Error(`Configuración inválida: ${validation.errors.join(', ')}`);
  }

  const results = {
    'oh-my-openagent.json': await omoGen.generate(projectConfig),
    'opencode.jsonc': await opencodeGen.generate(projectConfig),
    '.env': await envGen.generate(projectConfig),
    'AGENTS-README.md': await readmeGen.generate(projectConfig),
    'setup-ubuntu.sh': await setupGen.generateUbuntu(projectConfig),
    'setup-debian.sh': await setupGen.generateDebian(projectConfig)
  };
  
  return results;
}
