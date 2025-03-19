'use server'

import { getJsonProjectRepository } from "./infrastructure/json.projects.repository";
import { SaveProject } from "./repositories/save-project";
import { LoadProjects } from "./repositories/load-projects";
import { LoadSections } from "./repositories/load-sections";
import { LoadTasks } from "./repositories/load-tasks";
import { Project, Section, Task } from "./types";
import { DeleteProject } from "./repositories/delete-project";

const JsonProjectRepository = await getJsonProjectRepository('projects.json');

const _load_projects: LoadProjects = JsonProjectRepository;
const _load_sections: LoadSections = JsonProjectRepository;
const _load_tasks: LoadTasks = JsonProjectRepository;
const _create_project: SaveProject = JsonProjectRepository;
const _delete_project: DeleteProject = JsonProjectRepository;

// PROJECTS
export async function load_projects(): Promise<Project[]> {
  return _load_projects.load_all_projects()
}

export async function load_project_by_id(id: string): Promise<Project | undefined> {
  return _load_projects.load_project_by_id(id);
}

export async function save_project(project: Project): Promise<void> {
  return _create_project.save_project(project)
}

export async function delete_project(project_id: string): Promise<void> {
  return _delete_project.delete_project(project_id)
}

