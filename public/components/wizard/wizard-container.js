export default {
  render(container) {
    container.innerHTML = `
      <div class="wizard-view">
        <div class="wizard-header">
          <h2>✨ Configuración VibeCoding</h2>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 20%"></div>
          </div>
        </div>
        
        <div class="wizard-body card glass">
          <div id="step-content">
            <h3>Paso 1: Información del Proyecto</h3>
            <div class="form-group mt-4">
              <label>Nombre del Proyecto</label>
              <input type="text" id="proj-name" class="input-dark" placeholder="Ej: Mi App React">
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <input type="text" id="proj-desc" class="input-dark" placeholder="Qué hace este proyecto...">
            </div>
            <div class="form-group">
              <label>Plantilla Base</label>
              <select id="proj-template" class="input-dark">
                <option value="mi-setup-actual">Mi Setup Actual (1xOC, 1xCC, 1xXiaomi, OR)</option>
                <option value="budget-single">Budget (Solo 1x OpenCode Go)</option>
              </select>
            </div>
            <div class="form-group row mt-4">
              <label style="display:flex; align-items:center; gap: 8px;">
                <input type="checkbox" id="proj-cache" checked>
                Activar Modo Cache-Friendly (Ahorro Masivo de Tokens)
              </label>
              <p class="text-secondary" style="font-size: 0.8em; margin-top:4px;">Genera headers de sesión y evita "Cache Misses" en el proveedor.</p>
            </div>
          </div>
        </div>
        
        <div class="wizard-footer">
          <button class="btn btn-secondary" onclick="window.location.hash='#dashboard'">Cancelar</button>
          <button class="btn btn-primary" onclick="window.appWizard.finish()">Generar Configuraciones 🚀</button>
        </div>
      </div>
    `;
    window.appWizard = this;
  },

  async finish() {
    try {
      const data = {
        name: document.getElementById('proj-name').value || 'Proyecto Nuevo',
        description: document.getElementById('proj-desc').value,
        cacheOptimization: document.getElementById('proj-cache').checked,
        providers: ['opencode-go', 'commandcode', 'xiaomi', 'openrouter'],
        accounts: {
          'opencode-go': [{ id: 'opencode-go-1', label: 'Principal', envKey: 'OPENCODE_GO_1_AUTH' }],
          'commandcode': [{ id: 'commandcode-1', label: 'Principal', envKey: 'COMMANDCODE_1_API_KEY' }],
          'xiaomi': [{ id: 'xiaomi-1', label: 'Principal', envKey: 'XIAOMI_1_API_KEY' }],
          'openrouter': [{ id: 'openrouter', label: 'OpenRouter', envKey: 'OPENROUTER_API_KEY' }]
        },
        agents: {
          "sisyphus": { "model": "kimi-k2.6", "source": "opencode-go-1", "fallbacks": ["openrouter/moonshot/kimi-k2.6"] }
        }
      };

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const resData = await res.json();
      if (resData.ok) {
        alert('¡Proyecto guardado y listo!');
        window.location.hash = '#dashboard';
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }
}
