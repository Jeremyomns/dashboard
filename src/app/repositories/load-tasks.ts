import { Task } from "../types";

export interface LoadTasks {
  load_tasks(section_id: string): Promise<Task[]>;
}