/**
 * ═══════════════════════════════════════════════════════════════
 * ORQUESTADOR VIBECODING — Servidor Express Principal
 * ═══════════════════════════════════════════════════════════════
 * 
 * API REST completa para gestión de proyectos, proveedores,
 * cuentas, costos y agentes personalizados.
 * 
 * Puerto: 3847
 * Módulos: ES Modules (import/export)
 * 
 * @module server
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import archiver from 'archiver';

// ─── Configuración de rutas base ──────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const PORT = process.env.PORT || 3847;
const app = express();

// ─── Directorios del proyecto ─────────────────────────────────
const DIRS = {
  projects: path.join(__dirname, 'projects'),
  templates: path.join(__dirname, 'templates'),
  data: path.join(__dirname, 'src', 'data'),
  generators: path.join(__dirname, 'src', 'generators'),
  public: path.join(__dirname, 'public'),
};

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════

/**
 * Asegura que un directorio exista, creándolo si es necesario
 * @param {string} dirPath - Ruta del directorio
 */
async function asegurarDirectorio(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Ignorar si ya existe
    if (error.code !== 'EEXIST') throw error;
  }
}

/**
 * Lee un archivo JSON de forma segura, devuelve null si no existe
 * @param {string} filePath - Ruta del archivo JSON
 * @returns {Promise<object|null>}
 */
async function leerJSON(filePath) {
  try {
    const contenido = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(contenido);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw new Error(`Error al leer JSON en ${filePath}: ${error.message}`);
  }
}

/**
 * Escribe un objeto como JSON formateado
 * @param {string} filePath - Ruta destino
 * @param {object} data - Datos a escribir
 */
async function escribirJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Wrapper para rutas async — captura errores y los envía como JSON
 * @param {Function} fn - Función async del handler
 * @returns {Function}
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde public/
app.use(express.static(DIRS.public));

// ═══════════════════════════════════════════════════════════════
// CATÁLOGOS DE DATOS (cargados bajo demanda)
// ═══════════════════════════════════════════════════════════════

/**
 * Carga un catálogo de datos desde src/data/
 * Si el archivo no existe, devuelve un array vacío o un objeto vacío
 * @param {string} nombre - Nombre del archivo (sin extensión)
 * @returns {Promise<object|Array>}
 */
async function cargarCatalogo(nombre) {
  const ruta = path.join(DIRS.data, `${nombre}.json`);
  const datos = await leerJSON(ruta);
  if (datos === null) {
    console.warn(`⚠️  Catálogo '${nombre}.json' no encontrado en src/data/ — devolviendo estructura vacía`);
    return [];
  }
  return datos;
}

// ═══════════════════════════════════════════════════════════════
// GENERADORES (importados dinámicamente)
// ═══════════════════════════════════════════════════════════════

/**
 * Importa y ejecuta los generadores de configuración para un proyecto
 * @param {object} proyecto - Datos del proyecto
 * @returns {Promise<object>} Archivos generados
 */
async function ejecutarGeneradores(proyecto) {
  const archivosGenerados = {};

  try {
    const configEnginePath = path.join(__dirname, 'src', 'core', 'config-engine.js');
    
    try {
      await fs.access(configEnginePath);
    } catch {
      return {
        _aviso: 'Los generadores aún no están implementados en src/core/config-engine.js',
        proyecto_id: proyecto.id,
      };
    }

    const generador = await import(pathToFileURL(configEnginePath).href);
    
    if (typeof generador.generateAllConfigs === 'function') {
      const resultado = await generador.generateAllConfigs(proyecto);
      Object.assign(archivosGenerados, resultado);
    } else {
      archivosGenerados._aviso = 'El generador no exporta la función generateAllConfigs()';
    }
  } catch (error) {
    archivosGenerados._error = `Error ejecutando generadores: ${error.message}`;
  }

  return archivosGenerados;
}

// ═══════════════════════════════════════════════════════════════
// RUTAS: PROYECTOS (/api/projects)
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/projects — Listar todos los proyectos
 */
app.get('/api/projects', asyncHandler(async (req, res) => {
  await asegurarDirectorio(DIRS.projects);
  const archivos = await fs.readdir(DIRS.projects);
  const proyectos = [];

  for (const archivo of archivos) {
    if (!archivo.endsWith('.json')) continue;
    const datos = await leerJSON(path.join(DIRS.projects, archivo));
    if (datos) proyectos.push(datos);
  }

  // Ordenar por fecha de creación (más reciente primero)
  proyectos.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  res.json({ ok: true, count: proyectos.length, projects: proyectos });
}));

/**
 * GET /api/projects/:id — Obtener detalle de un proyecto
 */
app.get('/api/projects/:id', asyncHandler(async (req, res) => {
  const proyecto = await leerJSON(path.join(DIRS.projects, `${req.params.id}.json`));
  
  if (!proyecto) {
    return res.status(404).json({ ok: false, error: `Proyecto '${req.params.id}' no encontrado` });
  }

  res.json({ ok: true, project: proyecto });
}));

/**
 * POST /api/projects — Crear un nuevo proyecto
 * Body: { name, description, template?, providers?, agents?, accounts? }
 */
app.post('/api/projects', asyncHandler(async (req, res) => {
  await asegurarDirectorio(DIRS.projects);

  const id = uuidv4();
  const ahora = new Date().toISOString();

  const proyecto = {
    id,
    name: req.body.name || 'Proyecto sin nombre',
    description: req.body.description || '',
    template: req.body.template || null,
    providers: req.body.providers || [],
    accounts: req.body.accounts || {},
    agents: req.body.agents || {},
    runtime_fallback: req.body.runtime_fallback || {
      enabled: true,
      retry_on_errors: [400, 429, 503, 529],
      max_fallback_attempts: 3,
      cooldown_seconds: 60,
      timeout_seconds: 30,
      notify_on_fallback: true,
    },
    background_task: req.body.background_task || {
      defaultConcurrency: 5,
      staleTimeoutMs: 180000,
    },
    cacheOptimization: req.body.cacheOptimization === undefined ? true : req.body.cacheOptimization,
    custom_agents: req.body.custom_agents || [],
    createdAt: ahora,
    updatedAt: ahora,
  };

  await escribirJSON(path.join(DIRS.projects, `${id}.json`), proyecto);

  res.status(201).json({ ok: true, project: proyecto });
}));

/**
 * PUT /api/projects/:id — Actualizar un proyecto existente
 */
app.put('/api/projects/:id', asyncHandler(async (req, res) => {
  const rutaProyecto = path.join(DIRS.projects, `${req.params.id}.json`);
  const existente = await leerJSON(rutaProyecto);

  if (!existente) {
    return res.status(404).json({ ok: false, error: `Proyecto '${req.params.id}' no encontrado` });
  }

  // Mezclar datos existentes con los nuevos (preservar id y createdAt)
  const actualizado = {
    ...existente,
    ...req.body,
    id: existente.id,
    createdAt: existente.createdAt,
    updatedAt: new Date().toISOString(),
  };

  await escribirJSON(rutaProyecto, actualizado);
  res.json({ ok: true, project: actualizado });
}));

/**
 * DELETE /api/projects/:id — Eliminar un proyecto
 */
app.delete('/api/projects/:id', asyncHandler(async (req, res) => {
  const rutaProyecto = path.join(DIRS.projects, `${req.params.id}.json`);

  try {
    await fs.access(rutaProyecto);
  } catch {
    return res.status(404).json({ ok: false, error: `Proyecto '${req.params.id}' no encontrado` });
  }

  await fs.unlink(rutaProyecto);
  res.json({ ok: true, message: `Proyecto '${req.params.id}' eliminado` });
}));

/**
 * POST /api/projects/:id/generate — Generar archivos de configuración
 */
app.post('/api/projects/:id/generate', asyncHandler(async (req, res) => {
  const proyecto = await leerJSON(path.join(DIRS.projects, `${req.params.id}.json`));

  if (!proyecto) {
    return res.status(404).json({ ok: false, error: `Proyecto '${req.params.id}' no encontrado` });
  }

  const archivosGenerados = await ejecutarGeneradores(proyecto);

  res.json({
    ok: true,
    project_id: req.params.id,
    generated: archivosGenerados,
  });
}));

/**
 * GET /api/projects/:id/export — Exportar proyecto como ZIP
 */
app.get('/api/projects/:id/export', asyncHandler(async (req, res) => {
  const proyecto = await leerJSON(path.join(DIRS.projects, `${req.params.id}.json`));

  if (!proyecto) {
    return res.status(404).json({ ok: false, error: `Proyecto '${req.params.id}' no encontrado` });
  }

  // Configurar headers para descarga de ZIP
  const nombreArchivo = `orquestador-${proyecto.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.zip`;
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);

  const archive = archiver('zip', { zlib: { level: 9 } });

  // Manejar errores del archiver
  archive.on('error', (err) => {
    console.error('❌ Error al crear ZIP:', err);
    if (!res.headersSent) {
      res.status(500).json({ ok: false, error: 'Error al crear archivo ZIP' });
    }
  });

  // Pipe al response
  archive.pipe(res);

  // Agregar el proyecto como JSON
  archive.append(JSON.stringify(proyecto, null, 2), { name: 'project.json' });

  // Intentar generar archivos de configuración e incluirlos
  try {
    const generados = await ejecutarGeneradores(proyecto);
    for (const [nombre, contenido] of Object.entries(generados)) {
      if (nombre.startsWith('_')) continue; // Saltar metadatos internos
      const contenidoStr = typeof contenido === 'string' ? contenido : JSON.stringify(contenido, null, 2);
      archive.append(contenidoStr, { name: nombre });
    }
  } catch (error) {
    // Si los generadores fallan, incluir solo el proyecto base
    console.warn('⚠️  Generadores no disponibles para exportación:', error.message);
  }

  await archive.finalize();
}));

// ═══════════════════════════════════════════════════════════════
// RUTAS: DATOS (/api/providers, /api/models, /api/agents, /api/templates)
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/providers — Catálogo de proveedores
 */
app.get('/api/providers', asyncHandler(async (req, res) => {
  const datos = await cargarCatalogo('providers-catalog');
  res.json({ ok: true, providers: datos });
}));

/**
 * GET /api/models — Catálogo de modelos
 */
app.get('/api/models', asyncHandler(async (req, res) => {
  const datos = await cargarCatalogo('models-catalog');
  res.json({ ok: true, models: datos });
}));

/**
 * GET /api/agents — Catálogo de agentes
 */
app.get('/api/agents', asyncHandler(async (req, res) => {
  const datos = await cargarCatalogo('agents-catalog');
  res.json({ ok: true, agents: datos });
}));

/**
 * GET /api/templates — Listar plantillas disponibles
 */
app.get('/api/templates', asyncHandler(async (req, res) => {
  await asegurarDirectorio(DIRS.templates);
  const archivos = await fs.readdir(DIRS.templates);
  const plantillas = [];

  for (const archivo of archivos) {
    if (!archivo.endsWith('.json')) continue;
    const datos = await leerJSON(path.join(DIRS.templates, archivo));
    if (datos) {
      plantillas.push({
        filename: archivo,
        name: datos.name || archivo,
        description: datos.description || '',
        providers: datos.providers || [],
      });
    }
  }

  res.json({ ok: true, count: plantillas.length, templates: plantillas });
}));

/**
 * GET /api/templates/:name — Obtener una plantilla específica
 */
app.get('/api/templates/:name', asyncHandler(async (req, res) => {
  // Asegurar extensión .json
  const nombre = req.params.name.endsWith('.json') ? req.params.name : `${req.params.name}.json`;
  const datos = await leerJSON(path.join(DIRS.templates, nombre));

  if (!datos) {
    return res.status(404).json({ ok: false, error: `Plantilla '${nombre}' no encontrada` });
  }

  res.json({ ok: true, template: datos });
}));

// ═══════════════════════════════════════════════════════════════
// RUTAS: CUENTAS (/api/accounts)
// ═══════════════════════════════════════════════════════════════

/**
 * Archivo de configuración de cuentas
 * Las cuentas se almacenan en src/data/accounts.json
 */
const ACCOUNTS_FILE = path.join(DIRS.data, 'accounts.json');

/**
 * Lee las cuentas desde el archivo de configuración
 * @returns {Promise<Array>}
 */
async function leerCuentas() {
  await asegurarDirectorio(DIRS.data);
  const datos = await leerJSON(ACCOUNTS_FILE);
  return datos || [];
}

/**
 * GET /api/accounts — Listar todas las cuentas
 */
app.get('/api/accounts', asyncHandler(async (req, res) => {
  const cuentas = await leerCuentas();
  res.json({ ok: true, count: cuentas.length, accounts: cuentas });
}));

/**
 * POST /api/accounts — Agregar una nueva cuenta
 * Body: { provider, label, envKey?, config? }
 */
app.post('/api/accounts', asyncHandler(async (req, res) => {
  const cuentas = await leerCuentas();

  const nueva = {
    id: uuidv4(),
    provider: req.body.provider || 'unknown',
    label: req.body.label || 'Cuenta nueva',
    envKey: req.body.envKey || null,
    config: req.body.config || {},
    active: req.body.active ?? true,
    createdAt: new Date().toISOString(),
  };

  cuentas.push(nueva);
  await escribirJSON(ACCOUNTS_FILE, cuentas);

  res.status(201).json({ ok: true, account: nueva });
}));

/**
 * PUT /api/accounts/:id — Actualizar una cuenta
 */
app.put('/api/accounts/:id', asyncHandler(async (req, res) => {
  const cuentas = await leerCuentas();
  const indice = cuentas.findIndex(c => c.id === req.params.id);

  if (indice === -1) {
    return res.status(404).json({ ok: false, error: `Cuenta '${req.params.id}' no encontrada` });
  }

  // Actualizar campos (preservar id y createdAt)
  cuentas[indice] = {
    ...cuentas[indice],
    ...req.body,
    id: cuentas[indice].id,
    createdAt: cuentas[indice].createdAt,
    updatedAt: new Date().toISOString(),
  };

  await escribirJSON(ACCOUNTS_FILE, cuentas);
  res.json({ ok: true, account: cuentas[indice] });
}));

/**
 * DELETE /api/accounts/:id — Eliminar una cuenta
 */
app.delete('/api/accounts/:id', asyncHandler(async (req, res) => {
  let cuentas = await leerCuentas();
  const existe = cuentas.some(c => c.id === req.params.id);

  if (!existe) {
    return res.status(404).json({ ok: false, error: `Cuenta '${req.params.id}' no encontrada` });
  }

  cuentas = cuentas.filter(c => c.id !== req.params.id);
  await escribirJSON(ACCOUNTS_FILE, cuentas);

  res.json({ ok: true, message: `Cuenta '${req.params.id}' eliminada` });
}));

/**
 * POST /api/accounts/:id/test — Probar conexión de una cuenta
 * Realiza una petición HTTP al endpoint del proveedor para verificar la API key
 */
app.post('/api/accounts/:id/test', asyncHandler(async (req, res) => {
  const cuentas = await leerCuentas();
  const cuenta = cuentas.find(c => c.id === req.params.id);

  if (!cuenta) {
    return res.status(404).json({ ok: false, error: `Cuenta '${req.params.id}' no encontrada` });
  }

  // Cargar catálogo de proveedores para obtener endpoint de prueba
  const proveedores = await cargarCatalogo('providers-catalog');
  const proveedor = Array.isArray(proveedores)
    ? proveedores.find(p => p.id === cuenta.provider)
    : proveedores[cuenta.provider];

  if (!proveedor || !proveedor.testEndpoint) {
    return res.json({
      ok: true,
      status: 'no_test',
      message: `No hay endpoint de prueba configurado para el proveedor '${cuenta.provider}'`,
    });
  }

  // Obtener la API key desde variables de entorno
  const apiKey = cuenta.envKey ? process.env[cuenta.envKey] : null;

  if (!apiKey) {
    return res.json({
      ok: true,
      status: 'no_key',
      message: `Variable de entorno '${cuenta.envKey}' no configurada`,
    });
  }

  // Realizar petición de prueba al proveedor
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const respuesta = await fetch(proveedor.testEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    res.json({
      ok: true,
      status: respuesta.ok ? 'connected' : 'error',
      httpStatus: respuesta.status,
      message: respuesta.ok
        ? `Conexión exitosa a ${cuenta.provider}`
        : `Error HTTP ${respuesta.status} al conectar con ${cuenta.provider}`,
    });
  } catch (error) {
    res.json({
      ok: true,
      status: 'unreachable',
      message: `No se pudo conectar con ${cuenta.provider}: ${error.message}`,
    });
  }
}));

/**
 * PUT /api/accounts/switch — Cambiar la cuenta activa
 * Body: { accountId }
 */
app.put('/api/accounts/switch', asyncHandler(async (req, res) => {
  const { accountId } = req.body;

  if (!accountId) {
    return res.status(400).json({ ok: false, error: 'Se requiere accountId en el body' });
  }

  const cuentas = await leerCuentas();
  const cuenta = cuentas.find(c => c.id === accountId);

  if (!cuenta) {
    return res.status(404).json({ ok: false, error: `Cuenta '${accountId}' no encontrada` });
  }

  // Desactivar todas las cuentas del mismo proveedor, activar la seleccionada
  for (const c of cuentas) {
    if (c.provider === cuenta.provider) {
      c.active = (c.id === accountId);
    }
  }

  await escribirJSON(ACCOUNTS_FILE, cuentas);

  res.json({
    ok: true,
    message: `Cuenta activa cambiada a '${cuenta.label}' para proveedor '${cuenta.provider}'`,
    activeAccount: cuenta,
  });
}));

// ═══════════════════════════════════════════════════════════════
// RUTAS: COSTOS (/api/costs)
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/costs/summary — Resumen de costos del proyecto actual
 * Query: ?projectId=<uuid>
 */
app.get('/api/costs/summary', asyncHandler(async (req, res) => {
  const { projectId } = req.query;

  if (!projectId) {
    return res.status(400).json({ ok: false, error: 'Se requiere query param projectId' });
  }

  const proyecto = await leerJSON(path.join(DIRS.projects, `${projectId}.json`));

  if (!proyecto) {
    return res.status(404).json({ ok: false, error: `Proyecto '${projectId}' no encontrado` });
  }

  // Cargar catálogo de modelos para obtener precios
  const modelos = await cargarCatalogo('models-catalog');
  const catalogoModelos = Array.isArray(modelos)
    ? Object.fromEntries(modelos.map(m => [m.id, m]))
    : modelos;

  // Calcular resumen de costos por agente
  const agentes = proyecto.agents || {};
  const resumen = {
    projectId,
    projectName: proyecto.name,
    agents: {},
    totalMonthlyEstimate: 0,
  };

  for (const [nombreAgente, config] of Object.entries(agentes)) {
    const modelo = catalogoModelos[config.model];
    const costoInput = modelo?.pricing?.input || 0;   // Costo por 1M tokens de entrada
    const costoOutput = modelo?.pricing?.output || 0;  // Costo por 1M tokens de salida

    resumen.agents[nombreAgente] = {
      model: config.model,
      source: config.source,
      pricing: {
        inputPer1M: costoInput,
        outputPer1M: costoOutput,
      },
    };
  }

  res.json({ ok: true, summary: resumen });
}));

/**
 * GET /api/costs/estimate — Estimar costo de una sesión
 * Query: ?hours=X&intensity=Y (low|medium|high)
 */
app.get('/api/costs/estimate', asyncHandler(async (req, res) => {
  const horas = parseFloat(req.query.hours) || 1;
  const intensidad = req.query.intensity || 'medium';

  // Tokens estimados por hora según intensidad de uso
  const tokensPerHour = {
    low: { input: 50000, output: 15000 },
    medium: { input: 150000, output: 50000 },
    high: { input: 400000, output: 150000 },
  };

  const perfil = tokensPerHour[intensidad] || tokensPerHour.medium;

  // Cargar modelos para precios de referencia
  const modelos = await cargarCatalogo('models-catalog');
  const listaModelos = Array.isArray(modelos) ? modelos : Object.values(modelos);

  // Calcular estimación por modelo
  const estimaciones = listaModelos.map(modelo => {
    const precioInput = modelo.pricing?.input || 0;
    const precioOutput = modelo.pricing?.output || 0;

    // Costo = (tokens * precio_por_1M) / 1_000_000 * horas
    const costoInput = (perfil.input * precioInput / 1_000_000) * horas;
    const costoOutput = (perfil.output * precioOutput / 1_000_000) * horas;

    return {
      model: modelo.id || modelo.name,
      costPerSession: Math.round((costoInput + costoOutput) * 10000) / 10000,
      breakdown: {
        input: Math.round(costoInput * 10000) / 10000,
        output: Math.round(costoOutput * 10000) / 10000,
      },
    };
  });

  res.json({
    ok: true,
    estimate: {
      hours: horas,
      intensity: intensidad,
      tokensPerHour: perfil,
      models: estimaciones,
    },
  });
}));

// ═══════════════════════════════════════════════════════════════
// RUTAS: AGENTES PERSONALIZADOS (/api/custom-agents)
// ═══════════════════════════════════════════════════════════════

/**
 * Archivo de agentes personalizados
 */
const CUSTOM_AGENTS_FILE = path.join(DIRS.data, 'custom-agents.json');

/**
 * Lee los agentes personalizados
 * @returns {Promise<Array>}
 */
async function leerAgentesPersonalizados() {
  await asegurarDirectorio(DIRS.data);
  const datos = await leerJSON(CUSTOM_AGENTS_FILE);
  return datos || [];
}

/**
 * GET /api/custom-agents — Listar agentes personalizados
 */
app.get('/api/custom-agents', asyncHandler(async (req, res) => {
  const agentes = await leerAgentesPersonalizados();
  res.json({ ok: true, count: agentes.length, customAgents: agentes });
}));

/**
 * POST /api/custom-agents — Crear un agente personalizado
 * Body: { name, role, model, source, systemPrompt?, fallbacks?, tools? }
 */
app.post('/api/custom-agents', asyncHandler(async (req, res) => {
  const agentes = await leerAgentesPersonalizados();

  const nuevo = {
    id: uuidv4(),
    name: req.body.name || 'agente-nuevo',
    role: req.body.role || 'general',
    model: req.body.model || 'deepseek-v4-flash',
    source: req.body.source || 'opencode-go-1',
    systemPrompt: req.body.systemPrompt || '',
    fallbacks: req.body.fallbacks || [],
    tools: req.body.tools || [],
    createdAt: new Date().toISOString(),
  };

  agentes.push(nuevo);
  await escribirJSON(CUSTOM_AGENTS_FILE, agentes);

  res.status(201).json({ ok: true, customAgent: nuevo });
}));

/**
 * PUT /api/custom-agents/:id — Actualizar un agente personalizado
 */
app.put('/api/custom-agents/:id', asyncHandler(async (req, res) => {
  const agentes = await leerAgentesPersonalizados();
  const indice = agentes.findIndex(a => a.id === req.params.id);

  if (indice === -1) {
    return res.status(404).json({ ok: false, error: `Agente personalizado '${req.params.id}' no encontrado` });
  }

  agentes[indice] = {
    ...agentes[indice],
    ...req.body,
    id: agentes[indice].id,
    createdAt: agentes[indice].createdAt,
    updatedAt: new Date().toISOString(),
  };

  await escribirJSON(CUSTOM_AGENTS_FILE, agentes);
  res.json({ ok: true, customAgent: agentes[indice] });
}));

/**
 * DELETE /api/custom-agents/:id — Eliminar un agente personalizado
 */
app.delete('/api/custom-agents/:id', asyncHandler(async (req, res) => {
  let agentes = await leerAgentesPersonalizados();
  const existe = agentes.some(a => a.id === req.params.id);

  if (!existe) {
    return res.status(404).json({ ok: false, error: `Agente personalizado '${req.params.id}' no encontrado` });
  }

  agentes = agentes.filter(a => a.id !== req.params.id);
  await escribirJSON(CUSTOM_AGENTS_FILE, agentes);

  res.json({ ok: true, message: `Agente personalizado '${req.params.id}' eliminado` });
}));

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE DE ERRORES GLOBAL
// ═══════════════════════════════════════════════════════════════

/**
 * Manejador global de errores — devuelve JSON en lugar de HTML
 */
app.use((err, req, res, _next) => {
  console.error('❌ Error no manejado:', err.message);
  console.error(err.stack);

  res.status(err.status || 500).json({
    ok: false,
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

/**
 * Ruta catch-all para 404 en la API
 */
app.use('/api/*', (req, res) => {
  res.status(404).json({
    ok: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// ═══════════════════════════════════════════════════════════════
// INICIO DEL SERVIDOR
// ═══════════════════════════════════════════════════════════════

/**
 * Inicializa directorios necesarios y arranca el servidor
 */
async function iniciarServidor() {
  // Crear directorios necesarios si no existen
  await Promise.all([
    asegurarDirectorio(DIRS.projects),
    asegurarDirectorio(DIRS.templates),
    asegurarDirectorio(DIRS.data),
    asegurarDirectorio(DIRS.public),
  ]);

  app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  🎯 ORQUESTADOR VIBECODING — Servidor API');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  📡 Puerto:    http://localhost:${PORT}`);
    console.log(`  📂 Público:   ${DIRS.public}`);
    console.log(`  📁 Proyectos: ${DIRS.projects}`);
    console.log('');
    console.log('  📋 Rutas disponibles:');
    console.log('  ─────────────────────────────────────────────────────');
    console.log('  PROYECTOS:');
    console.log('    GET    /api/projects');
    console.log('    GET    /api/projects/:id');
    console.log('    POST   /api/projects');
    console.log('    PUT    /api/projects/:id');
    console.log('    DELETE /api/projects/:id');
    console.log('    POST   /api/projects/:id/generate');
    console.log('    GET    /api/projects/:id/export');
    console.log('');
    console.log('  DATOS:');
    console.log('    GET    /api/providers');
    console.log('    GET    /api/models');
    console.log('    GET    /api/agents');
    console.log('    GET    /api/templates');
    console.log('    GET    /api/templates/:name');
    console.log('');
    console.log('  CUENTAS:');
    console.log('    GET    /api/accounts');
    console.log('    POST   /api/accounts');
    console.log('    PUT    /api/accounts/:id');
    console.log('    DELETE /api/accounts/:id');
    console.log('    POST   /api/accounts/:id/test');
    console.log('    PUT    /api/accounts/switch');
    console.log('');
    console.log('  COSTOS:');
    console.log('    GET    /api/costs/summary?projectId=<uuid>');
    console.log('    GET    /api/costs/estimate?hours=X&intensity=Y');
    console.log('');
    console.log('  AGENTES PERSONALIZADOS:');
    console.log('    GET    /api/custom-agents');
    console.log('    POST   /api/custom-agents');
    console.log('    PUT    /api/custom-agents/:id');
    console.log('    DELETE /api/custom-agents/:id');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
  });
}

// Arrancar el servidor
iniciarServidor().catch((error) => {
  console.error('💥 Error fatal al iniciar el servidor:', error);
  process.exit(1);
});

export default app;
