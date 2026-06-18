import { promises as fs } from 'fs';
import path from 'path';

/**
 * Gestor de proyectos del Orquestador VibeCoding
 */

const PROJECTS_DIR = path.join(process.cwd(), 'projects');

export async function ensureProjectsDir() {
  try {
    await fs.access(PROJECTS_DIR);
  } catch {
    await fs.mkdir(PROJECTS_DIR, { recursive: true });
  }
}

export async function listProjects() {
  await ensureProjectsDir();
  const files = await fs.readdir(PROJECTS_DIR);
  const projects = [];
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const data = await fs.readFile(path.join(PROJECTS_DIR, file), 'utf-8');
      try {
        const parsed = JSON.parse(data);
        projects.push(parsed);
      } catch (e) {
        console.error(`Error parseando proyecto ${file}:`, e);
      }
    }
  }
  
  return projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function getProject(id) {
  try {
    const data = await fs.readFile(path.join(PROJECTS_DIR, `${id}.json`), 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    throw new Error(`Proyecto ${id} no encontrado`);
  }
}

export async function createProject(data) {
  await ensureProjectsDir();
  const id = crypto.randomUUID();
  const project = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await fs.writeFile(path.join(PROJECTS_DIR, `${id}.json`), JSON.stringify(project, null, 2));
  return project;
}

export async function updateProject(id, data) {
  const existing = await getProject(id);
  const updated = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  await fs.writeFile(path.join(PROJECTS_DIR, `${id}.json`), JSON.stringify(updated, null, 2));
  return updated;
}

export async function deleteProject(id) {
  try {
    await fs.unlink(path.join(PROJECTS_DIR, `${id}.json`));
    return true;
  } catch (e) {
    throw new Error(`Error eliminando proyecto ${id}`);
  }
}
