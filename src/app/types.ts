export interface Project {
  id: string;
  title: string;
  description?: string;
  progress: number;
  sections?: Section[];
  createdTime?: string;
}

export interface Section {
  id: string;
  title: string;
  project_id?: string;
  tasks?: Task[];
  createdTime?: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  section_id?: string;
  createdTime?: string;
}