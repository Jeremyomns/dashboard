'use server'

import { Project } from "../types";

export interface SaveProject {
  save_project(project: Project): Promise<void>;
}