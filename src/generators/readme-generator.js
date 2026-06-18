export async function generate(projectConfig) {
  let md = `# 🤖 Guía de Agentes — ${projectConfig.name || 'Mi Proyecto'}\n\n`;
  
  if (projectConfig.description) {
    md += `${projectConfig.description}\n\n`;
  }
  
  md += `## Agentes Disponibles\n\n`;
  
  for (const [agentId, agentConfig] of Object.entries(projectConfig.agents || {})) {
    // Buscar la metadata del agente si estuviera cargada o usar defaults
    const icon = agentConfig.icon || '🤖';
    const name = agentConfig.name || agentId;
    const role = agentConfig.role || 'Agente';
    
    md += `### ${icon} ${name} (${role})\n`;
    if (agentConfig.description) md += `- **Qué hace**: ${agentConfig.description}\n`;
    md += `- **Modelo**: ${agentConfig.model} via ${agentConfig.source}\n`;
    
    if (agentConfig.fallbacks && agentConfig.fallbacks.length > 0) {
      md += `- **Fallback**: ${agentConfig.fallbacks.join(' → ')}\n`;
    }
    
    md += `- **Costo por sesión**: ~$0.10-0.30 (Estimado)\n\n`;
  }
  
  return md;
}
