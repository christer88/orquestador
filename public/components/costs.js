export default {
  async render(container) {
    container.innerHTML = `
      <div class="costs-view">
        <div class="header-actions" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
          <h2 class="main-content__title">Métricas y Gastos de Inteligencia Artificial</h2>
          <button class="btn btn--secondary" onclick="window.appCostsManager.refreshData()">🔄 Recargar</button>
        </div>

        <!-- Tarjetas de Resumen -->
        <div class="metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6);">
          <div class="card" style="padding: var(--space-4); border: 1px solid var(--border); background: #FFFFFF; border-radius: var(--radius-md); text-align: center;">
            <div style="font-size: var(--text-xs); color: #64748B; font-weight: 600; text-transform: uppercase; margin-bottom: var(--space-1);">Gasto Acumulado</div>
            <div id="cost-total" style="font-size: 2rem; font-weight: 700; color: #0284C7;">$0.00 USD</div>
          </div>
          <div class="card" style="padding: var(--space-4); border: 1px solid var(--border); background: #FFFFFF; border-radius: var(--radius-md); text-align: center;">
            <div style="font-size: var(--text-xs); color: #64748B; font-weight: 600; text-transform: uppercase; margin-bottom: var(--space-1);">Tokens Totales</div>
            <div id="tokens-total" style="font-size: 2rem; font-weight: 700; color: #0284C7;">0</div>
          </div>
          <div class="card" style="padding: var(--space-4); border: 1px solid var(--border); background: #FFFFFF; border-radius: var(--radius-md); text-align: center;">
            <div style="font-size: var(--text-xs); color: #64748B; font-weight: 600; text-transform: uppercase; margin-bottom: var(--space-1);">Peticiones API</div>
            <div id="requests-total" style="font-size: 2rem; font-weight: 700; color: #0284C7;">0</div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="card" style="padding: var(--space-4); border: 1px solid var(--border); background: #FFFFFF; border-radius: var(--radius-md); margin-bottom: var(--space-6);">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4);">
            <div>
              <label style="font-weight: 600; font-size: var(--text-xs); display: block; margin-bottom: var(--space-1); color: #0F172A;">Filtrar por Proyecto</label>
              <select id="costs-filter-project" class="form-select" style="padding: var(--space-2);" onchange="window.appCostsManager.applyFilters()">
                <option value="">Todos los proyectos</option>
              </select>
            </div>
            <div>
              <label style="font-weight: 600; font-size: var(--text-xs); display: block; margin-bottom: var(--space-1); color: #0F172A;">Filtrar por Proveedor</label>
              <select id="costs-filter-provider" class="form-select" style="padding: var(--space-2);" onchange="window.appCostsManager.applyFilters()">
                <option value="">Todos los proveedores</option>
                <option value="xiaomi">Xiaomi (MiMo)</option>
                <option value="cavoti">Cavoti (GPT/Claude)</option>
                <option value="opencode-go">OpenCode Go</option>
                <option value="openrouter">OpenRouter</option>
                <option value="nvidia">NVIDIA</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Sección de Gráficas -->
        <div class="charts-section" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: var(--space-6); margin-bottom: var(--space-6);">
          <div class="card" style="padding: var(--space-4); border: 1px solid var(--border); background: #FFFFFF; border-radius: var(--radius-md); min-height: 320px; display: flex; flex-direction: column;">
            <h3 style="margin-top: 0; margin-bottom: var(--space-4); font-size: var(--text-sm); font-weight: 600; color: #0F172A;">Consumo de Tokens por Modelo</h3>
            <div style="flex: 1; position: relative;">
              <canvas id="chart-models"></canvas>
            </div>
          </div>
          <div class="card" style="padding: var(--space-4); border: 1px solid var(--border); background: #FFFFFF; border-radius: var(--radius-md); min-height: 320px; display: flex; flex-direction: column;">
            <h3 style="margin-top: 0; margin-bottom: var(--space-4); font-size: var(--text-sm); font-weight: 600; color: #0F172A;">Gasto Financiero por Cuenta Asociada</h3>
            <div style="flex: 1; position: relative;">
              <canvas id="chart-accounts"></canvas>
            </div>
          </div>
        </div>

        <!-- Tabla de Historial -->
        <div class="card" style="padding: var(--space-4); border: 1px solid var(--border); background: #FFFFFF; border-radius: var(--radius-md);">
          <h3 style="margin-top: 0; margin-bottom: var(--space-4); font-size: var(--text-sm); font-weight: 600; color: #0F172A;">Historial Detallado de Consumo</h3>
          <div style="overflow-x: auto;">
            <table class="table" style="width: 100%; border-collapse: collapse; font-size: var(--text-xs);">
              <thead>
                <tr style="border-bottom: 2px solid var(--border); text-align: left;">
                  <th style="padding: var(--space-3); color: #64748B;">Fecha y Hora</th>
                  <th style="padding: var(--space-3); color: #64748B;">Proyecto</th>
                  <th style="padding: var(--space-3); color: #64748B;">Modelo</th>
                  <th style="padding: var(--space-3); color: #64748B;">Proveedor</th>
                  <th style="padding: var(--space-3); color: #64748B;">Cuenta Utilizada</th>
                  <th style="padding: var(--space-3); color: #64748B; text-align: right;">Tokens Entrada</th>
                  <th style="padding: var(--space-3); color: #64748B; text-align: right;">Tokens Salida</th>
                  <th style="padding: var(--space-3); color: #64748B; text-align: right;">Costo (USD)</th>
                </tr>
              </thead>
              <tbody id="costs-table-body">
                <tr>
                  <td colspan="8" style="text-align: center; padding: var(--space-4); color: #64748B;">No hay registros de consumo cargados.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    window.appCostsManager = this;
    this.rawLogs = [];
    this.filteredLogs = [];
    this.charts = {};

    await this.loadChartJs();
    await this.fetchData();
  },

  async loadChartJs() {
    if (window.Chart) return;
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  },

  async fetchData() {
    try {
      const res = await fetch('/api/stats/token-logs');
      const data = await res.json();
      if (data.ok) {
        this.rawLogs = data.logs || [];
        this.populateFilters();
        this.applyFilters();
      }
    } catch (e) {
      console.error('Error fetching token logs:', e);
    }
  },

  refreshData() {
    this.fetchData();
  },

  populateFilters() {
    const projSelect = document.getElementById('costs-filter-project');
    if (!projSelect) return;

    // Obtener proyectos únicos
    const projects = [...new Set(this.rawLogs.map(log => log.projectName || log.projectId))].filter(Boolean);
    
    // Limpiar opciones manteniendo la primera
    projSelect.innerHTML = '<option value="">Todos los proyectos</option>' + 
      projects.map(p => `<option value="${p}">${p}</option>`).join('');
  },

  applyFilters() {
    const projectFilter = document.getElementById('costs-filter-project')?.value || '';
    const providerFilter = document.getElementById('costs-filter-provider')?.value || '';

    this.filteredLogs = this.rawLogs.filter(log => {
      const matchesProject = !projectFilter || (log.projectName === projectFilter || log.projectId === projectFilter);
      const matchesProvider = !providerFilter || (log.provider === providerFilter);
      return matchesProject && matchesProvider;
    });

    // Ordenar de más reciente a más antiguo
    this.filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    this.updateSummaryCards();
    this.updateTable();
    this.renderCharts();
  },

  updateSummaryCards() {
    const costTotalEl = document.getElementById('cost-total');
    const tokensTotalEl = document.getElementById('tokens-total');
    const requestsTotalEl = document.getElementById('requests-total');

    let totalCost = 0;
    let totalTokens = 0;

    this.filteredLogs.forEach(log => {
      totalCost += log.cost || 0;
      totalTokens += (log.promptTokens || 0) + (log.completionTokens || 0);
    });

    if (costTotalEl) costTotalEl.textContent = `$${totalCost.toFixed(4)} USD`;
    if (tokensTotalEl) tokensTotalEl.textContent = totalTokens.toLocaleString();
    if (requestsTotalEl) requestsTotalEl.textContent = this.filteredLogs.length.toLocaleString();
  },

  updateTable() {
    const tbody = document.getElementById('costs-table-body');
    if (!tbody) return;

    if (this.filteredLogs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: var(--space-4); color: #64748B;">No se encontraron registros bajo los filtros actuales.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.filteredLogs.map(log => {
      const fecha = new Date(log.timestamp).toLocaleString();
      const proveedorBadge = log.provider === 'xiaomi' ? 'badge--xiaomi' 
        : log.provider === 'opencode-go' ? 'badge--opencode'
        : log.provider === 'openrouter' ? 'badge--openrouter'
        : log.provider === 'cavoti' ? 'badge--moonshot'
        : 'badge--custom';
        
      return `
        <tr style="border-bottom: 1px solid var(--border);">
          <td style="padding: var(--space-3); color: #0F172A; font-weight: 500;">${fecha}</td>
          <td style="padding: var(--space-3); color: #475569;">${log.projectName || log.projectId}</td>
          <td style="padding: var(--space-3); font-family: var(--font-code); color: #0F172A; font-weight: 600;">${log.model}</td>
          <td style="padding: var(--space-3);"><span class="badge ${proveedorBadge}">${log.provider}</span></td>
          <td style="padding: var(--space-3); color: #475569; font-weight: 500;">${log.accountLabel || log.accountId}</td>
          <td style="padding: var(--space-3); text-align: right; color: #475569;">${(log.promptTokens || 0).toLocaleString()}</td>
          <td style="padding: var(--space-3); text-align: right; color: #475569;">${(log.completionTokens || 0).toLocaleString()}</td>
          <td style="padding: var(--space-3); text-align: right; color: #0284C7; font-weight: 600;">$${(log.cost || 0).toFixed(5)}</td>
        </tr>
      `;
    }).join('');
  },

  renderCharts() {
    if (!window.Chart) return;

    // Destruir gráficos anteriores
    if (this.charts.models) this.charts.models.destroy();
    if (this.charts.accounts) this.charts.accounts.destroy();

    // 1. Agrupar por modelo
    const modelGroups = {};
    this.filteredLogs.forEach(log => {
      const totalTokens = (log.promptTokens || 0) + (log.completionTokens || 0);
      modelGroups[log.model] = (modelGroups[log.model] || 0) + totalTokens;
    });

    const modelLabels = Object.keys(modelGroups);
    const modelData = Object.values(modelGroups);

    const ctxModels = document.getElementById('chart-models')?.getContext('2d');
    if (ctxModels) {
      this.charts.models = new Chart(ctxModels, {
        type: 'bar',
        data: {
          labels: modelLabels,
          datasets: [{
            label: 'Tokens Consumidos',
            data: modelData,
            backgroundColor: [
              'rgba(2, 132, 199, 0.7)',
              'rgba(14, 165, 233, 0.7)',
              'rgba(56, 189, 248, 0.7)',
              'rgba(125, 211, 252, 0.7)',
              'rgba(186, 230, 253, 0.7)'
            ],
            borderColor: 'rgb(2, 132, 199)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { font: { size: 10 } }
            },
            x: {
              ticks: { font: { size: 10 } }
            }
          }
        }
      });
    }

    // 2. Agrupar por cuenta asociada
    const accountGroups = {};
    this.filteredLogs.forEach(log => {
      const label = log.accountLabel || log.accountId;
      accountGroups[label] = (accountGroups[label] || 0) + (log.cost || 0);
    });

    const accountLabels = Object.keys(accountGroups);
    const accountData = Object.values(accountGroups);

    const ctxAccounts = document.getElementById('chart-accounts')?.getContext('2d');
    if (ctxAccounts) {
      this.charts.accounts = new Chart(ctxAccounts, {
        type: 'doughnut',
        data: {
          labels: accountLabels,
          datasets: [{
            data: accountData,
            backgroundColor: [
              '#0284C7',
              '#10B981',
              '#F59E0B',
              '#EF4444',
              '#8B5CF6',
              '#EC4899'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { font: { size: 10 } }
            }
          }
        }
      });
    }
  }
};
