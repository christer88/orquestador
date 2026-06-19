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
  const fullHash = window.location.hash || '#dashboard';
  const [hash, queryString] = fullHash.split('?');
  const content = document.getElementById('app-content');
  const navItems = document.querySelectorAll('.sidebar__nav-item');
  
  // Parse query params
  const params = {};
  if (queryString) {
    queryString.split('&').forEach(pair => {
      const [key, val] = pair.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(val || '');
    });
  }
  
  window.currentRouteParams = params;
  
  navItems.forEach(nav => {
    if (nav.getAttribute('href') === hash) {
      nav.classList.add('sidebar__nav-item--active');
    } else {
      nav.classList.remove('sidebar__nav-item--active');
    }
  });
  
  // Render views
  if (hash === '#dashboard') {
    import('./components/dashboard.js').then(m => m.default.render(content));
  } else if (hash === '#wizard') {
    import('./components/wizard/wizard-container.js').then(m => m.default.render(content));
  } else if (hash === '#help') {
    import('./components/help.js').then(m => m.default.render(content));
  } else if (hash === '#accounts') {
    import('./components/account-manager-ui.js').then(m => m.default.render(content));
  } else if (hash === '#templates') {
    import('./components/templates-ui.js').then(m => m.default.render(content));
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
