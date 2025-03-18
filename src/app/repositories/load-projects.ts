'use server'

import { Project } from "../types";

export interface LoadProjects {
  load_project_by_id(id: string): Promise<Project|undefined>;
  load_all_projects(): Promise<Project[]>;
}