import { Task } from "../types";

export interface CreateTask {
    create_task(task: Task): Promise<void>
}