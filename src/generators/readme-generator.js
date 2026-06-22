const AGENT_INFO = {
  "sisyphus": { 
    icon: "🧠", name: "Sisyphus", role: "Orquestador Principal", 
    desc: "El director de la orquesta. Recibe tus solicitudes, entiende el objetivo general, planifica los pasos y decide qué otros agentes especializados deben intervenir.",
    recomendacion: "**Recomendación de modelo:** Usa modelos Pro o de Alto Razonamiento.\n- *Propietarios:* **GPT-5.5, Claude Opus 4.8, Claude Sonnet 4.6**\n- *Open Source / Alternativos:* **DeepSeek V4 Pro, Qwen 3.7 Max, GLM-5.2**" 
  },
  "hephaestus": { 
    icon: "👨‍💻", name: "Hephaestus", role: "Ingeniero de Software", 
    desc: "El experto en programación. Escribe código, diseña arquitecturas complejas, refactoriza y resuelve problemas técnicos profundos.",
    recomendacion: "**Recomendación de modelo:** Usa modelos especializados en código con alta precisión lógica.\n- *Propietarios:* **Claude Sonnet 4.6, GPT-5.5 Pro**\n- *Open Source / Alternativos:* **DeepSeek V4 Pro, Kimi K2.7 Code, Qwen 3.7 Plus**"
  },
  "oracle": { 
    icon: "🌐", name: "Oracle", role: "Investigador Web", 
    desc: "El buscador. Tiene acceso a internet para buscar documentación actualizada, noticias, librerías modernas o resolver dudas de la web.",
    recomendacion: "**Recomendación de modelo:** Usa modelos Flash o ligeros que sean muy rápidos.\n- *Propietarios:* **GPT-5.4-mini, Claude Haiku 4.5**\n- *Open Source / Alternativos:* **DeepSeek V4 Flash, MiMo V2.5, GLM-5.1**"
  },
  "librarian": { 
    icon: "📚", name: "Librarian", role: "Gestor de Contexto", 
    desc: "El bibliotecario. Especialista en procesar enormes cantidades de texto, leer archivos completos del proyecto y encontrar dónde está cada cosa en el código base.",
    recomendacion: "**Recomendación de modelo:** Usa modelos con ventana de contexto inmensa.\n- *Propietarios:* **Claude Haiku 4.5, GPT-5.4-mini**\n- *Open Source / Alternativos:* **Kimi K2.6, Kimi K2.7, DeepSeek V4 Flash, MiniMax M3**"
  },
  "explore": { 
    icon: "🔍", name: "Explore", role: "Explorador de Sistemas", 
    desc: "Navega por la terminal, analiza la estructura de directorios y entiende cómo está montado el entorno de tu aplicación.",
    recomendacion: "**Recomendación de modelo:** Usa modelos Flash veloces y buenos siguiendo instrucciones.\n- *Propietarios:* **GPT-5.4-mini, Claude Haiku 4.5**\n- *Open Source / Alternativos:* **DeepSeek V4 Flash, MiMo V2.5, Qwen 3.6 Plus**"
  },
  "multimodal-looker": { 
    icon: "👁️", name: "Multimodal Looker", role: "Analista Visual", 
    desc: "Los ojos del sistema. Puede ver imágenes, analizar capturas de pantalla, extraer texto de fotos y evaluar diseños de interfaz (UI/UX).",
    recomendacion: "**Recomendación de modelo:** Usa obligatoriamente modelos Multimodales o Vision.\n- *Propietarios:* **GPT-5.5, Claude Sonnet 4.6**\n- *Open Source / Alternativos:* **MiMo V2 Omni, Qwen VL, GLM-4V**"
  },
  "prometheus": { 
    icon: "🔥", name: "Prometheus", role: "Pensador Creativo", 
    desc: "Ideal para lluvia de ideas, diseño de producto, redacción creativa y resolución de problemas abstractos.",
    recomendacion: "**Recomendación de modelo:** Usa modelos de alta expresión y creatividad.\n- *Propietarios:* **Claude Opus 4.8, Claude Opus 4.7, GPT-5.5**\n- *Open Source / Alternativos:* **MiMo V2.5 Pro, Qwen 3.7 Max, DeepSeek V4 Pro**"
  },
  "metis": { 
    icon: "📊", name: "Metis", role: "Analista Lógico", 
    desc: "Especialista en matemáticas, lógica, ciencia de datos y revisión analítica de arquitecturas complejas.",
    recomendacion: "**Recomendación de modelo:** Usa modelos con razonamiento analítico y matemático fuerte.\n- *Propietarios:* **GPT-5.5 Pro, Claude Opus 4.8**\n- *Open Source / Alternativos:* **DeepSeek V4 Pro, Qwen 3.7 Max, GLM-5.2**"
  },
  "momus": { 
    icon: "🛡️", name: "Momus", role: "Crítico y Tester", 
    desc: "El auditor. Cuestiona el código, encuentra posibles bugs, vulnerabilidades de seguridad y sugiere pruebas (testing) rigurosas.",
    recomendacion: "**Recomendación de modelo:** Usa modelos críticos o rápidos dependiendo del tamaño de la auditoría.\n- *Propietarios:* **GPT-5.5 (Pro) o GPT-5.4-mini (Flash)**\n- *Open Source / Alternativos:* **DeepSeek V4 Pro, MiMo V2.5 Pro**"
  },
  "atlas": { 
    icon: "⚙️", name: "Atlas", role: "DevOps", 
    desc: "Se encarga de comandos de sistema, infraestructura, despliegues, configuración de servidores y dependencias.",
    recomendacion: "**Recomendación de modelo:** Usa modelos Flash exactos para comandos de Linux/Terminal.\n- *Propietarios:* **Claude Haiku 4.5, GPT-5.4-mini**\n- *Open Source / Alternativos:* **DeepSeek V4 Flash, Qwen 3.6 Plus**"
  },
  "code-reviewer": { 
    icon: "👀", name: "Code Reviewer", role: "Revisor de Código", 
    desc: "Analiza el código escrito buscando malas prácticas, problemas de rendimiento y asegura que cumpla con los estándares de limpieza (Clean Code).",
    recomendacion: "**Recomendación de modelo:** Usa modelos con contexto grande si la base de código es extensa.\n- *Propietarios:* **Claude Sonnet 4.6, GPT-5.4-mini**\n- *Open Source / Alternativos:* **Kimi K2.6, DeepSeek V4 Flash, DeepSeek V4 Pro**"
  },
  "sisyphus-junior": { 
    icon: "⚡", name: "Sisyphus Junior", role: "Asistente Rápido", 
    desc: "Una versión más ligera y veloz del orquestador principal. Ideal para tareas rutinarias, rápidas o preguntas directas que no requieren un análisis profundo.",
    recomendacion: "**Recomendación de modelo:** Usa obligatoriamente modelos Mini o Flash súper baratos y veloces.\n- *Propietarios:* **GPT-5.4-mini, Claude Haiku 4.5**\n- *Open Source / Alternativos:* **DeepSeek V4 Flash, MiMo V2 Flash, GLM-5.1**"
  }
};

export async function generate(projectConfig) {
  let md = `# 🤖 Guía de Agentes — Funciones y Capacidades\n\n`;
  
  if (projectConfig.description) {
    md += `${projectConfig.description}\n\n`;
  }
  
  md += `Conoce a tu equipo de trabajo virtual. Cada uno de estos agentes tiene un rol específico en tu flujo de desarrollo. El orquestador principal delegará automáticamente las tareas al especialista adecuado según lo que necesites.\n\n`;
  
  md += `## Tu Equipo Especializado\n\n`;
  
  for (const agentId of Object.keys(projectConfig.agents || {})) {
    const info = AGENT_INFO[agentId] || { icon: "🤖", name: agentId, role: "Especialista Custom", desc: "Agente personalizado del proyecto.", recomendacion: "Usa el modelo que mejor se adapte a tu tarea personalizada." };
    
    md += `### ${info.icon} ${info.name} (${info.role})\n`;
    md += `${info.desc}\n\n`;
    if (info.recomendacion) {
      md += `${info.recomendacion}\n\n`;
    }
  }
  
  return md;
}
