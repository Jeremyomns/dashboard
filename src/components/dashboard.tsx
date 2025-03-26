'use client';

import React, { useState, useEffect } from 'react';
import ProjectList from '@/components/project-list'
import Button from './button';
import { empty_project, Project } from '@/app/types';
import { useProjects } from '@/contexts/project-context';
import { styles } from '@/app/styles';
import { Plus } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { projects, saveProject, fetchProjects, removeProject } = useProjects();
    const [isAddingProject, setIsAddingProject] = useState(false);
    const [isLoading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);


    const handleDeleteProject = async (projectId: string) => {
        setLoading(true)
        try {
            await removeProject(projectId).finally(() => setLoading(false))
        } catch (e) {
            setError('Erreur lors de la suppression du projet.')
        }
    };

    const handleAddNewProject = async (project: Project) => {
        const newId = Math.max(0, ...projects.map(p => +p.id) ?? []) + 1;
        const project_to_add = { ...project, id: newId.toString() }
        projects.unshift(project_to_add)
        await saveProject(project_to_add);
        setIsAddingProject(false);
        await fetchProjects()
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Mes Projets</h2>
                <Button
                    variant='primary'
                    onClick={() => setIsAddingProject(true)}
                >
                    <Plus size={18} className="mr-1" />
                    Nouveau Projet
                </Button>
            </div>

            {isAddingProject && (
                <AddProjectForm
                    onAddproject={handleAddNewProject}
                    onCancel={() => setIsAddingProject(false)}
                />
            )}

            <ProjectList
                onDelete={handleDeleteProject}>
            </ProjectList>
        </div>

    );
};

interface AddProjectFormProps {
    onAddproject: (project: Project) => void;
    onCancel: () => void;
}

const AddProjectForm: React.FC<AddProjectFormProps> = ({ onAddproject, onCancel }: AddProjectFormProps) => {
    const [newProject, setNewProject] = useState(empty_project());

    const handleAddProject = async () => {
        if (!newProject.title.trim()) return;
        onAddproject(newProject)
    };

    const handleCancel = async () => {
        setNewProject(empty_project())
        onCancel()
    };

    return (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-3">Ajouter un nouveau projet</h3>
            <input
                type="text"
                placeholder="Titre du projet"
                className={`${styles.input} mb-3`}
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            />
            <textarea
                placeholder="Description (optionnelle)"
                className={`${styles.input} mb-3`}
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            />
            <div className="flex justify-end space-x-2">
                <Button
                    variant='secondary'
                    onClick={() => handleCancel()}
                >
                    Annuler
                </Button>
                <Button variant='primary' onClick={handleAddProject}>
                    Ajouter
                </Button>
            </div>
        </div>
    )
}

export default Dashboard;
