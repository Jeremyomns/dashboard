'use server'

import { Project } from "../types";

export interface LoadProjects {
  load_all_projects(): Promise<Project[]>;
}