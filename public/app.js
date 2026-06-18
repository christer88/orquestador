/**
 * Router y State Management para Orquestador VibeCoding
 */

const state = {
  projects: [],
  providers: [],
  models: [],
  agents: [],
  currentProject: null
};

// API Client
const api = {
  get: async (endpoint) => {
    const res = await fetch(`/api${endpoint}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  post: async (endpoint, data) => {
    const res = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};

async function loadData() {
  try {
    const [providers, models, agents] = await Promise.all([
      api.get('/providers'),
      api.get('/models'),
      api.get('/agents')
    ]);
    state.providers = providers;
    state.models = models;
    state.agents = agents;
  } catch (e) {
    showToast('Error cargando catálogos', 'error');
  }
}

function handleRoute() {
  const hash = window.location.hash || '#dashboard';
  const content = document.getElementById('app-content');
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(nav => {
    if (nav.getAttribute('href') === hash) nav.classList.add('active');
    else nav.classList.remove('active');
  });
  
  // Render views
  if (hash === '#dashboard') {
    import('./components/dashboard.js').then(m => m.default.render(content));
  } else if (hash === '#wizard') {
    import('./components/wizard/wizard-container.js').then(m => m.default.render(content));
  } else if (hash === '#cost-monitor') {
    import('./components/cost-monitor.js').then(m => m.default.render(content));
  } else {
    content.innerHTML = `<h2>Vista no encontrada</h2>`;
  }
}

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

window.addEventListener('hashchange', handleRoute);

// Init
loadData().then(() => {
  if (!window.location.hash) window.location.hash = '#dashboard';
  handleRoute();
});
