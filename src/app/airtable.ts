import Airtable from "airtable";
import { Project, Section, Task } from "./types";

Airtable.configure({
  apiKey: process.env.AIR_TABLE_TOKEN});

const base = Airtable.base(process.env.AIR_TABLE_BASE_ID || '');

const PROJECTS_TABLE = "projects";
const SECTIONS_TABLE = "sections";
const TASKS_TABLE = "tasks";


// GET
export async function getProjects(): Promise<Project[]> {
  const records = await base(PROJECTS_TABLE).select().all();
  const projects = records.map(
    (p) =>
      ({
        id: p.id,
        ...p.fields,
      } as Project)
  );

  projects.forEach(async (p) => p.sections = await getSections(p.id))
  
  console.log(projects);
  
  return projects;
};

export const getSections = async (projectId?: string): Promise<Section[]> => {
  let query = base(SECTIONS_TABLE).select();

  if (projectId) {
    query = base(SECTIONS_TABLE).select({
      filterByFormula: `{project_id} = '${projectId}'`,
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

  sections.map(async (s) => s.tasks = await getTasks(s.id))
  return sections
};

export const getTasks = async (sectionId?: string): Promise<Task[]> => {
  let query = base(TASKS_TABLE).select();

  if (sectionId) {
    query = base(TASKS_TABLE).select({
      filterByFormula: `{section_id} = '${sectionId}'`,
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
};

// CREATE
export const createProject = async (project: any) => {
  const record: any = await base(PROJECTS_TABLE).create(project);
  return {
    id: record.id,
    ...record.fields,
  };
};

export const createSection = async (section: any) => {
  const record: any = await base(SECTIONS_TABLE).create(section);
  return {
    id: record.id,
    ...record.fields,
  };
};

export const createTask = async (task: any) => {
  const record: any = await base(TASKS_TABLE).create(task);
  return {
    id: record.id,
    ...record.fields,
  };
};

// UPDATE
export const updateProject = async (id: string, fields: any) => {
  const record = await base(PROJECTS_TABLE).update(id, fields);
  return {
    id: record.id,
    ...record.fields,
  };
};


export const updateSection = async (id: string, fields: any) => {
  const record: any = await base(SECTIONS_TABLE).update(id, fields);
  return {
    id: record.id,
    ...record.fields,
  };
};

export const updateTask = async (id: string, fields: any) => {
  const record = await base(TASKS_TABLE).update(id, fields);
  return {
    id: record.id,
    ...record.fields,
  };
};

// DELETE
export const deleteProject = async (id: string) => {
  return await base(PROJECTS_TABLE).destroy(id);
};

export const deleteSection = async (id: string) => {
  return await base(SECTIONS_TABLE).destroy(id);
};

export const deleteTask = async (id: string) => {
  return await base(TASKS_TABLE).destroy(id);
};



