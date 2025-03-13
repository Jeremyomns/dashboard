'use server'

import { getJsonProjectRepository } from "./infrastructure/json.projects.repository";
import { CreateProject } from "./repositories/create-project";
import { LoadProjects } from "./repositories/load-projects";
import { LoadSections } from "./repositories/load-sections";
import { LoadTasks } from "./repositories/load-tasks";
import { Project, Section, Task } from "./types";

const JsonProjectRepository = await getJsonProjectRepository('projects.json');

const _load_projects: LoadProjects = JsonProjectRepository;
const _load_sections: LoadSections = JsonProjectRepository;
const _load_tasks: LoadTasks = JsonProjectRepository;
const _create_project: CreateProject = JsonProjectRepository;

export async function load_projects(): Promise<Project[]> {
  return _load_projects.load_all_projects()
}

export async function load_sections(project_id: string): Promise<Section[]> {
  return _load_sections.load_sections(project_id);
}

export async function laod_tasks(section_id: string): Promise<Task[]> {
  return _load_tasks.load_tasks(section_id)
}

export async function create_project(project: Project): Promise<void> {
  return _create_project.create_project(project)
}