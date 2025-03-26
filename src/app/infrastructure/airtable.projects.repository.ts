import Airtable, { FieldSet, Table } from "airtable";
import { LoadProjects } from "../repositories/load-projects";
import { Project, Section, Task } from "../types";
import { SaveProject } from "../repositories/save-project";

Airtable.configure({
  apiKey: process.env.AIR_TABLE_TOKEN
});

const base = Airtable.base(process.env.AIR_TABLE_BASE_ID || '');


export class AirtableProjectsRepository implements
  LoadProjects,
  SaveProject {
  private readonly base;
  private readonly projects_table: Table<FieldSet>;
  private readonly sections_table: Table<FieldSet>;
  private readonly tasks_table: Table<FieldSet>;

  constructor(
    private readonly token: string,
    private readonly base_id: string,
    projects_table_name = "projects",
    sections_table_name = "sections",
    tasks_table_name = "tasks",
  ) {
    if (token === '' || base_id === '')
      throw new Error(`Airtable token ('${token}') or base Id ('${base_id}') is empty.`)

    Airtable.configure({ apiKey: token });
    this.base = Airtable.base(base_id);
    this.projects_table = this.base(projects_table_name);
    this.sections_table = this.base(sections_table_name);
    this.tasks_table = this.base(tasks_table_name);
  }
  load_project_by_id(id: string): Promise<Project | undefined> {
    throw new Error("Method not implemented.");
  }

  async load_all_projects(): Promise<Project[]> {
    const records = await this.projects_table.select().all();
    const projects = records.map(
      (p) =>
      ({
        id: p.id,
        ...p.fields,
      } as Project)
    );

    projects.forEach(async (p) => p.sections = await this.load_sections(p.id));

    console.log(projects);

    return projects;
  }

  async load_sections(project_id?: string): Promise<Section[]> {
    let query = this.sections_table.select();

    if (project_id) {
      query = this.sections_table.select({
        filterByFormula: `{project_id} = '${project_id}'`,
      });
    }

    let records = await query.all();
    let sections = records.map(
      (s) =>
      ({
        id: s.id,
        ...s.fields,
      } as Section)
    );

    sections.map(async (s) => s.tasks = await this.load_tasks(s.id))
    return sections
  }

  async load_tasks(section_id?: string): Promise<Task[]> {
    let query = this.tasks_table.select();

    if (section_id) {
      query = this.tasks_table.select({
        filterByFormula: `{section_id} = '${section_id}'`,
      });
    }

    const records = await query.all();
    return records.map(
      (record) =>
      ({
        id: record.id,
        ...record.fields,
        completed:
          record.fields.completed === "true" ||
          record.fields.completed === true,
      } as Task)
    );
  }

  save_project(project: Project): Promise<void> {
    throw new Error("Method not implemented.");
  }
}