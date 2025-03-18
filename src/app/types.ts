export interface Project {
  id: string;
  title: string;
  description?: string;
  progress: number;
  sections?: Section[];
  createdTime?: string;
}

export const empty_project = (): Project => ({
  id: '',
  title: '',
  description: '',
  progress: 0,
  sections: [],
  createdTime: new Date().toISOString(),
})

export interface Section {
  id: string;
  title: string;
  project_id?: string;
  tasks?: Task[];
  createdTime?: string;
}

export const empty_section = (): Section => ({
  id: '',
  title: '',
  project_id: '',
  tasks: [],
  createdTime: new Date().toISOString(),
})

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  section_id?: string;
  createdTime?: string;
}

export const empty_task = (): Task => ({
  id: '',
  title: '',
  completed: false,
  section_id: '',
  createdTime: new Date().toISOString(),
})




export function projects_with_new_section(projects: Project[], section: Section): Project[] {
  return projects.map(p => {
    if (p.id === section.project_id) return project_with_new_section(p, section)
    else return p
  })
}

export function projects_with_updated_section(projects: Project[], updated: Section): Project[] {
  return projects.map(p => {
    if (p.id === updated.project_id) return project_with_updated_section(p, updated)
    else return p
  })
}

export function projects_with_new_task(projects: Project[], added: Task) {
  return projects.map(p => {
    p.sections?.map(s => {
      if (s.id === added.section_id) return section_with_new_task(s, added)
      return s
    })
    return p
  })
}

export function projects_with_updated_task(projects: Project[], updated: Task): Project[] {
  const s = get_section_in_projects_by_id(projects, updated.id);
  const p = get_project_in_projects_by_id(projects, s?.project_id ?? null);
  if (!s || !p) return projects

  return projects_with_updated_section(projects, section_with_updated_task(s, updated))

}

export function project_with_new_section(project: Project, section: Section): Project {
  return {
    ...project,
    sections: project.sections ? [...project.sections, section] : [section]
  } satisfies Project;
}



export function project_with_updated_section(project: Project, updated: Section): Project {
  return {
    ...project,
    sections: project.sections
      ? project.sections.map(s => s.id === updated.id ? updated : s)
      : [updated]
  } satisfies Project
}

export function projects_with_updated_project(projects: Project[], updated_project: Project): Project[] {
  return projects.map(p => {
    if (p.id === updated_project.id) return updated_project
    else return p
  })
}

export function sections_with_updated_section(sections: Section[], updated: Section) {
  return sections.map(s => {
    if (s.id === updated.id) updated
    return s
  })
}

export function section_with_new_task(section: Section, task: Task): Section {
  return {
    ...section,
    tasks: section.tasks ? [...section.tasks, task] : [task]
  } satisfies Section
}

export function section_with_updated_task(section: Section, updated: Task) {
  return {
    ...section,
    tasks: section.tasks?.map(t => t.id === updated.id ? updated : t) ?? []
  } satisfies Section
}

export function get_project_in_projects_by_id(projets: Project[], id: string | null): Project | undefined {
  if (!id) return undefined
  else return projets.find(p => p.id === id)
}

export function get_section_in_projects_by_id(projets: Project[], id: string | null): Section | undefined {
  if (!id) return undefined
  else return projets.flatMap(p => p.sections ?? []).find(s => s.id === id);
}

export function get_task_in_projects_by_id(projets: Project[], id: string | null): Section | undefined {
  if (!id) return undefined
  return projets
    .flatMap(p => p.sections?.flatMap(s => s.tasks ?? []) ?? [])
    .find(t => t?.id === id);
}