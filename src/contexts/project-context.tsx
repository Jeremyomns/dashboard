'use client';

import { delete_project, load_projects, save_project } from '@/app/projects.controller';
import { Project, projects_with_updated_project } from '@/app/types';
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

interface ProjectContextType {
    projects: Project[];
    fetchProjects: () => Promise<void>;
    saveProject: (project: Project) => Promise<void>;
    removeProject: (projectId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType>({
    projects: [],
    fetchProjects: () => Promise.resolve(),
    saveProject: () => Promise.resolve(),
    removeProject: () => Promise.resolve(),
});

export const useProjects = () => useContext(ProjectContext)

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>([]);

    const fetchProjects = useCallback(async () => {
        setProjects(await load_projects());
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const removeProject = async (projectId: string) => {
        setProjects((prev) => prev.filter(p => p.id !== projectId));
        return delete_project(projectId);
    };

    const saveProject = async(project: Project) => {
        await save_project(project)
        setProjects(projects_with_updated_project(projects, project))
    }

    return (
        <ProjectContext.Provider value={{ projects, fetchProjects, saveProject, removeProject }}>
            {children}
        </ProjectContext.Provider>
    );
};
