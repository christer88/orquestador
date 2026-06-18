export default {
  render(container) {
    container.innerHTML = `
      <div class="dashboard-view">
        <div class="header-actions">
          <h2>Tus Proyectos</h2>
          <button class="btn btn-primary" onclick="window.location.hash='#wizard'">✨ Nuevo Proyecto</button>
        </div>
        <div class="grid projects-grid" id="projects-list">
          <div class="loading">Cargando proyectos...</div>
        </div>
      </div>
    `;
    
    this.loadProjects();
  },
  
  async loadProjects() {
    try {
      const res = await fetch('/api/projects');
      const projects = await res.json();
      
      const list = document.getElementById('projects-list');
      if (projects.length === 0) {
        list.innerHTML = `
          <div class="empty-state card">
            <h3>No tienes proyectos aún</h3>
            <p>Comienza creando tu primer entorno VibeCoding con configuración multi-proveedor.</p>
          </div>
        `;
        return;
      }
      
      list.innerHTML = projects.map(p => `
        <div class="card project-card glass">
          <h3>${p.name || 'Sin nombre'}</h3>
          <p class="text-secondary">${p.description || 'Sin descripción'}</p>
          <div class="card-footer" style="margin-top: 16px; display: flex; gap: 8px;">
             <span class="badge badge-green">${p.providers?.length || 0} Fuentes</span>
             <div style="margin-left: auto; display: flex; gap: 8px;">
               <button class="btn btn-secondary btn-sm" onclick="window.location.hash='#wizard?id=${p.id}'">Editar</button>
               <a href="/api/projects/${p.id}/export" class="btn btn-primary btn-sm" style="text-decoration: none;">Descargar ZIP</a>
             </div>
          </div>
        </div>
      `).join('');
    } catch (e) {
      document.getElementById('projects-list').innerHTML = `<div class="error">Error: ${e.message}</div>`;
    }
  }
}
