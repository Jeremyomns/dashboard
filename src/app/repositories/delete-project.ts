export interface DeleteProject {
    delete_project(project_id: string): Promise<void>
}