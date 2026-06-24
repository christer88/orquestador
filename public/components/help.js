export default {
  readmeContent: '',
  agentsReadmeContent: '',
  projects: [],
  selectedProjectId: '',

  async render(container) {
    // Exponer el componente para que los handlers puedan llamarlo
    window.appHelp = this;

    container.innerHTML = `
      <div class="help-view" style="max-width: var(--content-max-width); margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-6);">
        
        <!-- Header -->
        <div class="main-content__header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-4); border-bottom: 1px solid var(--border); padding-bottom: var(--space-4);">
          <div>
            <h2 class="main-content__title">📖 Ayuda y Documentación</h2>
            <p class="main-content__subtitle">Guías oficiales de funcionamiento del CoreVCO y los Agentes OmO.</p>
          </div>
          
          <!-- GitHub Card (Glassmorphic) -->
          <div class="github-links-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-3) var(--space-4); display: flex; align-items: center; gap: var(--space-3); backdrop-filter: blur(10px);">
            <div style="font-size: var(--text-xl);">🐙</div>
            <div>
              <div style="font-size: var(--text-xs); color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">GitHub Oficial</div>
              <div style="display: flex; gap: var(--space-3); margin-top: var(--space-1);">
                <a href="https://github.com/christer88/orquestador-vibecoding/blob/main/README.md" target="_blank" class="btn btn--secondary btn--sm" style="display: inline-flex; align-items: center; gap: var(--space-1); text-decoration: none;">
                  📄 README Principal
                </a>
                <a href="https://github.com/christer88/orquestador-vibecoding/blob/main/proyecto-ciberseguridad/AGENTS-README.md" target="_blank" class="btn btn--secondary btn--sm" style="display: inline-flex; align-items: center; gap: var(--space-1); text-decoration: none;">
                  🤖 README Agentes
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs Navigation -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2); padding: 4px; border-radius: var(--radius-md); border: 1px solid var(--border);">
          <div style="display: flex; gap: 4px;">
            <button id="tab-btn-system" class="btn btn--primary" style="padding: var(--space-2) var(--space-4); border-radius: var(--radius-md);" onclick="window.appHelp.switchTab('system')">
              🏠 Manual General del Sistema
            </button>
            <button id="tab-btn-agents" class="btn btn--secondary" style="padding: var(--space-2) var(--space-4); border-radius: var(--radius-md);" onclick="window.appHelp.switchTab('agents')">
              🤖 Guía de Agentes (OmO)
            </button>
          </div>
          
          <!-- Selector de Proyecto (eliminado) -->
        </div>

        <!-- Content Area -->
        <div class="card" style="padding: var(--space-6); min-height: 400px; background: rgba(var(--bg-card-rgb), 0.4); border: 1px solid var(--border); border-radius: var(--radius-lg); position: relative; overflow-y: auto;">
          <div id="help-loading-spinner" style="display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(var(--bg-card-rgb), 0.7); display: flex; align-items: center; justify-content: center; z-index: 10;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-3);">
              <span class="loading-spinner" style="width: 40px; height: 40px; border-width: 4px;"></span>
              <span style="font-size: var(--text-sm); color: var(--text-secondary);">Cargando guía...</span>
            </div>
          </div>
          
          <div id="help-markdown-content" class="help-markdown-body" style="color: var(--text-primary); line-height: 1.6;">
            <!-- Documento renderizado -->
          </div>
        </div>

      </div>
    `;

    // Cargar los datos iniciales
    await this.init();
  },

  async init() {
    this.switchTab('system');
  },

  async switchTab(tab) {
    const btnSystem = document.getElementById('tab-btn-system');
    const btnAgents = document.getElementById('tab-btn-agents');
    
    if (tab === 'system') {
      btnSystem.className = 'btn btn--primary';
      btnAgents.className = 'btn btn--secondary';
      
      await this.loadSystemReadme();
    } else {
      btnSystem.className = 'btn btn--secondary';
      btnAgents.className = 'btn btn--primary';
      
      await this.loadProjectsList();
      await this.loadAgentsReadme(this.selectedProjectId);
    }
  },

  async loadSystemReadme() {
    this.showSpinner(true);
    try {
      if (!this.readmeContent) {
        const res = await fetch('/api/help/system-readme');
        const data = await res.json();
        if (data.ok) {
          this.readmeContent = data.content;
        } else {
          throw new Error(data.error);
        }
      }
      this.renderMarkdown(this.readmeContent);
    } catch (err) {
      document.getElementById('help-markdown-content').innerHTML = `
        <div style="color: var(--error); padding: var(--space-4); border: 1px dashed var(--error); border-radius: var(--radius-md);">
          <h3>❌ Error cargando la guía del sistema</h3>
          <p>${err.message}</p>
        </div>
      `;
    } finally {
      this.showSpinner(false);
    }
  },

  async loadProjectsList() {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.ok) {
        this.projects = data.projects || [];
        
        const select = document.getElementById('help-project-select');
        if (select) {
          select.innerHTML = this.projects.map(p => 
            `<option value="${p.id}" ${p.id === this.selectedProjectId ? 'selected' : ''}>${p.name}</option>`
          ).join('');
          
          if (this.projects.length > 0 && !this.selectedProjectId) {
            this.selectedProjectId = this.projects[0].id;
          }
        }
      }
    } catch (err) {
      console.error("Error cargando listado de proyectos para ayuda", err);
    }
  },

  async loadAgentsReadme(projectId) {
    this.selectedProjectId = projectId || '';
    this.showSpinner(true);
    try {
      const url = this.selectedProjectId ? `/api/help/agents-readme?projectId=${this.selectedProjectId}` : '/api/help/agents-readme';
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) {
        this.agentsReadmeContent = data.content;
        this.renderMarkdown(this.agentsReadmeContent);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      document.getElementById('help-markdown-content').innerHTML = `
        <div style="color: var(--error); padding: var(--space-4); border: 1px dashed var(--error); border-radius: var(--radius-md);">
          <h3>❌ Error cargando la guía de agentes</h3>
          <p>${err.message}</p>
        </div>
      `;
    } finally {
      this.showSpinner(false);
    }
  },

  showSpinner(show) {
    const spinner = document.getElementById('help-loading-spinner');
    if (spinner) spinner.style.display = show ? 'flex' : 'none';
  },

  renderMarkdown(md) {
    const contentDiv = document.getElementById('help-markdown-content');
    if (contentDiv) {
      contentDiv.innerHTML = this.formatMarkdown(md);
    }
  },

  formatMarkdown(md) {
    if (!md) return '';
    
    // Guardar bloques de código para evitar que se aplique formato interno
    const codeBlocks = [];
    let formatText = md.replace(/```([\s\S]*?)```/g, (match, code) => {
      const id = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(code);
      return id;
    });

    // Reemplazar cabeceras
    formatText = formatText
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>');

    // Separadores
    formatText = formatText.replace(/^---$/gim, '<hr style="border: 0; height: 1px; background: var(--border); margin: var(--space-6) 0;">');

    // Listas desordenadas
    formatText = formatText.replace(/^\s*[\-\*]\s+(.*$)/gim, '<li>$1</li>');

    // Agrupar elementos li adyacentes en ul
    formatText = formatText.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

    // Enlaces
    formatText = formatText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="help-link" style="color: var(--primary-start); text-decoration: none; border-bottom: 1px dashed var(--primary-start); font-weight: 500;">$1</a>');

    // Texto en negrita
    formatText = formatText.replace(/\*\*([^*]+)\*\//g, '<strong>$1</strong>');
    formatText = formatText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Código en línea
    formatText = formatText.replace(/`([^`]+)`/g, '<code class="help-code-inline" style="background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: var(--radius-sm); font-family: var(--font-code); font-size: var(--text-sm); border: 1px solid rgba(255,255,255,0.08); color: var(--primary-start);">$1</code>');

    // Párrafos (líneas vacías)
    formatText = formatText.split('\n\n').map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<li') || trimmed.startsWith('<ul') || trimmed.startsWith('<hr') || trimmed.startsWith('__CODE_BLOCK_')) {
        return p;
      }
      return `<p style="margin-bottom: var(--space-4);">${p.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    // Restaurar bloques de código con estilo bonito
    codeBlocks.forEach((code, index) => {
      const id = `__CODE_BLOCK_${index}__`;
      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const html = `<pre class="help-code-block" style="background: rgba(0, 0, 0, 0.4); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-4); overflow-x: auto; margin-bottom: var(--space-5);"><code style="font-family: var(--font-code); font-size: var(--text-sm); color: #f8fafc; line-height: 1.5; display: block;">${escapedCode.trim()}</code></pre>`;
      formatText = formatText.replace(id, html);
    });

    return formatText;
  }
};
