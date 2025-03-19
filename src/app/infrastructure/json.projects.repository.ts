"use server"

import { SaveProject } from "../repositories/save-project";
import { LoadProjects } from "../repositories/load-projects";
import { LoadSections } from "../repositories/load-sections";
import { LoadTasks } from "../repositories/load-tasks";
import { Project, projects_with_new_section, projects_with_new_task, Section, Task } from "../types";
import * as fs from 'fs';
import { DeleteProject } from "../repositories/delete-project";
/*
const _projects: Project[] = [
  {
    id: '1',
    title: "Rénovation Maison",
    description: "Travaux de rénovation du salon et de la cuisine",
    progress: 35,
    sections: [
      {
        id: '1',
        title: "Travaux",
        tasks: [
          { id: '1', title: "Acheter peinture", completed: true },
          { id: '2', title: "Retirer ancien papier peint", completed: true },
          { id: '3', title: "Peindre les murs", completed: false },
          { id: '4', title: "Installer les nouvelles étagères", completed: false }
        ]
      },
      {
        id: '2',
        title: "Dépenses",
        tasks: [
          { id: '5', title: "Peinture: 120€", completed: true },
          { id: '6', title: "Outils: 85€", completed: true },
          { id: '7', title: "Étagères: 200€", completed: false }
        ]
      }
    ]
  },
  {
    id: '2',
    title: "Développement Site Web",
    description: "Création de mon site personnel",
    progress: 60,
    sections: [
      {
        id: '3',
        title: "Design",
        tasks: [
          { id: '8', title: "Créer maquette", completed: true },
          { id: '9', title: "Valider design", completed: true }
        ]
      },
      {
        id: '4',
        title: "Développement",
        tasks: [
          { id: '10', title: "Intégration HTML/CSS", completed: true },
          { id: '11', title: "Développer back-end", completed: false },
          { id: '12', title: "Tests utilisateurs", completed: false }
        ]
      }
    ]
  },
  {
    id: '3',
    title: "Organisation Vacances",
    description: "Planification des vacances d'été",
    progress: 20,
    sections: [
      {
        id: '5',
        title: "Réservations",
        tasks: [
          { id: '13', title: "Réserver vol", completed: true },
          { id: '14', title: "Réserver hôtel", completed: false },
          { id: '15', title: "Louer voiture", completed: false }
        ]
      },
      {
        id: '6',
        title: "Budget",
        tasks: [
          { id: '16', title: "Vol: 350€", completed: true },
          { id: '17', title: "Hébergement: 800€", completed: false },
          { id: '18', title: "Activités: 400€", completed: false }
        ]
      }
    ]
  }
];
*/

class JsonProjectRepository implements
  LoadProjects,
  LoadSections,
  LoadTasks,
  SaveProject,
  DeleteProject {

  constructor(private readonly path: string) {
    if (!fs.existsSync(path))
      fs.writeFileSync(path, JSON.stringify([]))
  }

  private save_in_file(projects: Project[]): Promise<void> {
    return fs.promises.writeFile(this.path, JSON.stringify(projects))
  }

  private async load_projects_from_json_file(): Promise<Project[]> {
    const json = await (await fs.promises.readFile(this.path)).toString();
    return (JSON.parse(json))
      .map((p: any) => ({ ...p, lastModifiedTime: new Date(Date.parse(p.lastModifiedTime)) } satisfies Project))
  }

  load_all_projects(): Promise<Project[]> {
    return this.load_projects_from_json_file()
  }

  async load_project_by_id(id: string): Promise<Project | undefined> {
    const projects = await this.load_projects_from_json_file()
    return projects.find(p => p.id === id)
  }


  async load_sections(project_id?: string): Promise<Section[]> {
    const projects = await this.load_all_projects();
    if (!project_id) return Promise.resolve(projects.flatMap(p => p.sections ?? []))

    return Promise.resolve(
      projects.find(p => p.id === project_id)?.sections ?? []
    )
  }

  async load_tasks(section_id?: string): Promise<Task[]> {
    if (!section_id) return (await this.load_sections(section_id)).flatMap(s => s.tasks ?? [])
    return (await this.load_sections(section_id)).flatMap(s => s.tasks ?? [])
  }

  async save_project(project: Project): Promise<void> {
    let projects = (await this.load_all_projects()).filter(p => p.id !== project.id)
    projects.push(project);
    return this.save_in_file(projects)
  }

  async create_section(section: Section): Promise<void> {
    return this.save_in_file(
      projects_with_new_section(
        await this.load_projects_from_json_file(),
        section
      ))
  }

  async delete_project(project_id: string): Promise<void> {
    return this.save_in_file(
      (await this.load_projects_from_json_file()).filter(p => p.id !== project_id)
    )
  }
}
export const getJsonProjectRepository = async (path: string) => new JsonProjectRepository(path)