'use server'

import { Project } from "../types";

export interface CreateProject {
  create_project(project: Project): Promise<void>;
}