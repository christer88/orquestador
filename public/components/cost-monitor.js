export default {
  render(container) {
    container.innerHTML = `
      <div class="cost-monitor-view">
        <div class="header-actions">
          <h2>📊 Monitor de Costos</h2>
          <button class="btn btn-secondary" onclick="window.location.reload()">Actualizar</button>
        </div>
        
        <div class="grid">
          <!-- Resumen Total -->
          <div class="card glass">
            <h3>💰 Costo Estimado (30 días)</h3>
            <div class="metric-large" id="total-cost">$0.00</div>
            <p class="text-secondary">Suscripciones + Uso API estimado</p>
          </div>
          
          <!-- Estimador de Sesión -->
          <div class="card glass">
            <h3>⏱️ Estimador de Sesión</h3>
            <div class="form-group row">
              <label>Horas: <input type="number" id="est-hours" value="4" min="1" max="24" class="input-dark"></label>
              <label>Intensidad: 
                <select id="est-intensity" class="input-dark">
                  <option value="low">Baja (Solo chat)</option>
                  <option value="medium" selected>Media (Coding normal)</option>
                  <option value="high">Alta (Refactor masivo)</option>
                </select>
              </label>
              <button class="btn btn-primary" onclick="window.appCostMonitor.estimate()">Calcular</button>
            </div>
            <div id="est-result" class="mt-4"></div>
          </div>
        </div>

        <div class="mt-4">
          <h3>Uso de Rate Limits (Ventana 5hr)</h3>
          <div id="rate-limits" class="card glass mt-2">
            <div class="loading">Cargando métricas...</div>
          </div>
        </div>
      </div>
    `;

    // Exponer al scope global temporalmente para eventos
    window.appCostMonitor = this;
    this.loadData();
  },

  async loadData() {
    try {
      // Mocked real API call for limits and total
      document.getElementById('total-cost').textContent = '$14.50';
      
      const rateLimits = document.getElementById('rate-limits');
      rateLimits.innerHTML = `
        <div class="cost-bar-container">
          <div class="cost-bar-label">
            <span>Kimi K2.6 (OpenCode Go)</span>
            <span>658 / 1,150 req (57%)</span>
          </div>
          <div class="cost-bar-track">
            <div class="cost-bar-fill" style="width: 57%; background: var(--tier-3);"></div>
          </div>
        </div>
        <div class="cost-bar-container mt-4">
          <div class="cost-bar-label">
            <span>DeepSeek V4 Pro</span>
            <span>412 / 3,300 req (12%)</span>
          </div>
          <div class="cost-bar-track">
            <div class="cost-bar-fill" style="width: 12%; background: var(--tier-2);"></div>
          </div>
        </div>
        <div class="cost-bar-container mt-4">
          <div class="cost-bar-label">
            <span>Budget $12/5hr</span>
            <span>$7.20 / $12.00 (60%)</span>
          </div>
          <div class="cost-bar-track">
            <div class="cost-bar-fill" style="width: 60%; background: var(--tier-4);"></div>
          </div>
        </div>
      `;
    } catch (e) {
      console.error(e);
    }
  },
  
  async estimate() {
    const hours = document.getElementById('est-hours').value;
    const intensity = document.getElementById('est-intensity').value;
    try {
      const res = await fetch(\`/api/costs/estimate?hours=\${hours}&intensity=\${intensity}\`);
      const data = await res.json();
      
      const r = document.getElementById('est-result');
      if (data.ok) {
        r.innerHTML = \`
          <h4>Costo extra estimado para \${hours}h (Intensidad: \${intensity})</h4>
          <ul class="text-secondary mt-2">
            \${data.estimate.models.slice(0, 3).map(m => \`
              <li>\${m.model}: $\${m.costPerSession}</li>
            \`).join('')}
          </ul>
        \`;
      }
    } catch (e) {
      console.error(e);
    }
  }
}
