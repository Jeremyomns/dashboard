'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle, FileText, Home, Settings, DollarSign, PlusCircle } from 'lucide-react';
import { empty_project, empty_section, empty_task, get_project_in_projects_by_id, get_section_in_projects_by_id, get_task_in_projects_by_id, Project, projects_with_new_section, projects_with_new_task, projects_with_updated_project, projects_with_updated_section, Section, Task } from './types';
import { load_projects, create_project, create_section_in_project, create_task_in_section } from './projects.controller';

const LocalStorage: Storage | null = (typeof window !== "undefined") ? localStorage : null;


// Styles globaux avec Tailwind
const styles = {
  container: "min-h-screen bg-gray-100 text-gray-900",
  header: "bg-gradient-to-r from-blue-500 to-40% to-purple-600 p-4 text-white shadow-md",
  title: "text-2xl font-bold",
  subtitle: "text-sm opacity-80",
  card: "bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer",
  cardHeader: "p-4 bg-gray-50 border-b",
  cardTitle: "font-semibold text-lg",
  cardDescription: "text-sm text-gray-600",
  cardBody: "p-4",
  button: "flex items-center justify-center rounded-md px-4 py-2 font-medium transition-colors duration-200",
  primaryButton: "bg-blue-500 hover:bg-blue-600 text-white",
  secondaryButton: "bg-gray-200 hover:bg-gray-300 text-gray-800",
  dangerButton: "bg-red-500 hover:bg-red-600 text-white",
  progressBar: "h-2 rounded-full bg-gray-200 overflow-hidden",
  progressBarFill: "h-full rounded-full",
  input: "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
  badge: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  gridLayout: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
};

// Composant principal du Dashboard
const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState<boolean>(false);
  const [newProject, setNewProject] = useState(empty_project());
  const [editMode, setEditMode] = useState<{active: boolean, type: 'project'|'section'|'task'|null, id: string|null}>({ active: false, type: null, id: null });
  const [editText, setEditText] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSection, setNewSection] = useState<Section>(empty_section());
  const [isAddingTask, setIsAddingTask] = useState<{ active: boolean, sectionId: string | null }>({ active: false, sectionId: null });
  const [newTask, setNewTask] = useState(empty_task());
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setProjects(await load_projects().finally(() => setLoading(false)))
    } catch (err) {
      setError('Erreur lors du chargement des projets');
      console.error(err);
    }
  };

  // Calcul du progrès d'un projet basé sur les tâches complétées
  const calculateProgress = (project: Project) => {
    const allTasks: Task[] = project.sections?.flatMap(section => section.tasks ?? []) ?? [];
    if (allTasks.length === 0) return 0;
    const completedTasks = allTasks.filter(task => task.completed).length;
    return Math.round((completedTasks / allTasks.length) * 100);
  };

  // Ajout d'un nouveau projet
  const handleAddProject = async () => {
    if (newProject.title.trim() === '') return;
    
    const newId = Math.max(0, ...projects.map(p => +p.id)) + 1;
    const projectToAdd: Project = {
      ...empty_project(),
      id: newId.toString(),
      title: newProject.title,
      description: newProject.description,
    };
    
    setLoading(true)
    try {
      await create_project(projectToAdd).finally(() => setLoading(false))
    } catch(e) {
      setError('Erreur lors de la création du projet')
      console.error(e);
    }
    setProjects([...projects, projectToAdd]);

    setIsAddingProject(false);
    setNewProject(empty_project());
  };

  // Ajout d'une nouvelle section à un projet
  const handleAddSection = async () => {
    if (newSection.title.trim() === '' || !selectedProject) return;

    // assume ids are int
    const newId = Math.max(0, ...projects.flatMap(p => p.sections?.map(s => +s.id) ?? [])) + 1;
    const section_to_add: Section = {
      id: newId.toString(),
      title: newSection.title,
      tasks: []
    }
    setLoading(true)
    try {
      await create_section_in_project(section_to_add).finally(() => setLoading(false))
    } catch(e) {
      setError('Erreur lors de la création de la section')
      return;
    }

    const updatedProjects: Project[] = projects_with_new_section(projects, section_to_add)

    setProjects(updatedProjects);
    setSelectedProject(updatedProjects.find(p => p.id === selectedProject.id) ?? null);
    setNewSection(empty_section());
    setIsAddingSection(false);
  };

  // Ajout d'une nouvelle tâche à une section
  const handleAddTask = async (sectionId: string) => {
    if (newTask.title.trim() === '' || !selectedProject) return;
    
    const newId = Math.max(0, ...projects.flatMap(p => p.sections?.flatMap(s => s.tasks?.map(t => +t.id) ?? []) ?? [])) + 1;
    const task_to_add: Task = {
      ...empty_task(),
      id: newId.toString(),
      title: newTask.title,
      completed: false
    }
    const updatedProjects: Project[] = projects_with_new_task(projects, task_to_add)
    
    const updatedProject: Project | null = updatedProjects.find(p => p.id === selectedProject.id) ?? null;
    if (!updatedProject) return;
    updatedProject.progress = calculateProgress(updatedProject);
    
    setLoading(true)
    try {
      await create_task_in_section(task_to_add).finally(() => setLoading(false))
    } catch(e) {
      setError('Erreur lors de la création de la section')
      return;
    }
    setProjects(updatedProjects);
    setSelectedProject(updatedProject);
    setNewTask(empty_task);
    setIsAddingTask({ active: false, sectionId: null });
  };

  // Suppression d'un projet
  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(project => project.id !== projectId);
    setProjects(updatedProjects);
    setSelectedProject(null);
  };

  // Suppression d'une section
  const handleDeleteSection = (sectionId: string) => {
    const updatedProjects = projects.map(project => {
      if (project.id === selectedProject?.id) {
        return {
          ...project,
          sections: project.sections?.filter(section => section.id !== sectionId)
        };
      }
      return project;
    });
    
    const updatedProject = updatedProjects.find(p => p.id === selectedProject?.id);
    if(!updatedProject) return;
    updatedProject.progress = calculateProgress(updatedProject);
    
    setProjects(updatedProjects);
    setSelectedProject(updatedProject);
  };

  // Suppression d'une tâche
  const handleDeleteTask = (sectionId: string, taskId: string) => {
    const updatedProjects: Project[] = projects.map(project => {
      if (project.id === selectedProject?.id) {
        return {
          ...project,
          sections: project.sections?.map(section => {
            if (section.id === sectionId) {
              return {
                ...section,
                tasks: section.tasks?.filter(task => task.id !== taskId)
              } satisfies Section;
            }
            return section;
          })
        };
      }
      return project;
    });
    
    const updatedProject = updatedProjects.find(p => p.id === selectedProject?.id);
    if (!updatedProject) return;
    updatedProject.progress = calculateProgress(updatedProject);
    
    setProjects(updatedProjects);
    setSelectedProject(updatedProject);
  };

  // Basculer l'état d'une tâche (complétée ou non)
  const handleToggleTask = (sectionId: string, taskId: string) => {
    const updatedProjects: Project[] = projects.map(project => {
      if (project.id === selectedProject?.id) {
        return {
          ...project,
          sections: project.sections?.map(section => {
            if (section.id === sectionId) {
              return {
                ...section,
                tasks: section.tasks?.map(task => {
                  if (task.id === taskId) {
                    return {
                      ...task,
                      completed: !task.completed
                    };
                  }
                  return task;
                })
              };
            }
            return section;
          })
        };
      }
      return project;
    });
    
    const updatedProject = updatedProjects.find(p => p.id === selectedProject?.id);
    if(!updatedProject) return;
    updatedProject.progress = calculateProgress(updatedProject);
    
    setProjects(updatedProjects);
    setSelectedProject(updatedProject);
  };

  // Gestion de l'édition des titres (projet, section, tâche)
  const startEdit = (type: 'project' | 'section' | 'task' | null, id: string, currentText: string) => {
    setEditMode({ active: true, type, id });
    setEditText(currentText);
  };

  const saveEdit = () => {
    if ((editText?.trim() ?? '') === '') {
      setEditMode({ active: false, type: null, id: null });
      return;
    }

    let updatedProjects = [...projects];

    switch (editMode.type) {
      case 'project':
        const p = get_project_in_projects_by_id(projects, editMode.id)
        if (p) {
          p.title = editText
          updatedProjects = projects_with_updated_project(projects, p)
        }
        break;

      case 'section':
        const s = get_section_in_projects_by_id(projects, editMode.id)
        if (s) {
          s.title = editText
          updatedProjects = projects_with_updated_section(projects, s)
        }
        break;

      case 'task':
        const [sectionId, taskId] = editMode.id?.split('-') ?? [null, null];
        const t = get_task_in_projects_by_id(projects, taskId)
        if(t) {
          t.title = editText
          updatedProjects = projects_with_updated_task(projects, t)
        }
        break;

      default:
        break;
    }

    setProjects(updatedProjects);
    
    if (selectedProject) {
      setSelectedProject(updatedProjects.find(p => p.id === selectedProject.id) ?? null);
    }
    
    setEditMode({ active: false, type: null, id: null });
  };

  // Rendu de la vue Home (liste des projets)
  const renderHomeView = () => (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Mes Projets</h2>
        <button 
          className={`${styles.button} ${styles.primaryButton}`}
          onClick={() => setIsAddingProject(true)}
        >
          <Plus size={18} className="mr-1" /> Nouveau Projet
        </button>
      </div>

      {isAddingProject && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-3">Ajouter un nouveau projet</h3>
          <input
            type="text"
            placeholder="Titre du projet"
            className={`${styles.input} mb-3`}
            value={newProject.title}
            onChange={(e) => setNewProject({...newProject, title: e.target.value})}
          />
          <textarea
            placeholder="Description (optionnelle)"
            className={`${styles.input} mb-3`}
            value={newProject.description}
            onChange={(e) => setNewProject({...newProject, description: e.target.value})}
          />
          <div className="flex justify-end space-x-2">
            <button 
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={() => {
                setIsAddingProject(false);
                setNewProject(empty_project());
              }}
            >
              Annuler
            </button>
            <button 
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={handleAddProject}
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      <div className={styles.gridLayout}>
        {projects.map(project => (
          <div 
            key={project.id}
            className={styles.card}
            onClick={() => setSelectedProject(project)}
          >
            <div className={styles.cardHeader}>
              <div className="flex justify-between items-start">
                <h3 className={styles.cardTitle}>{project.title}</h3>
                <button
                  className="text-gray-500 hover:text-red-500 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {project.description && (
                <p className={styles.cardDescription}>{project.description}</p>
              )}
            </div>
            <div className={styles.cardBody}>
              <div className="mb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Progression</span>
                  <span className="text-sm font-medium">{project.progress}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressBarFill}
                    style={{ 
                      width: `${project.progress}%`,
                      backgroundColor: 
                        project.progress < 30 ? '#f87171' :
                        project.progress < 70 ? '#facc15' : 
                        '#4ade80'
                    }}
                  />
                </div>
              </div>
              
              <div className="mt-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <FileText size={14} className="mr-1" />
                  <span>{project.sections?.flatMap(s => s.tasks).length || 0} tâche(s)</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Rendu de la vue détaillée d'un projet
  const renderProjectView = () => {
    if (!selectedProject) return null;

    return (
      <div className="p-4">
        <button 
          className={`${styles.button} ${styles.secondaryButton} mb-4`}
          onClick={() => setSelectedProject(null)}
        >
          <Home size={16} className="mr-1" /> Retour aux projets
        </button>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            {editMode.active && editMode.type === 'project' && editMode.id === selectedProject.id ? (
              <div className="flex items-center space-x-2 w-full">
                <input
                  type="text"
                  className={styles.input}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoFocus
                  onBlur={saveEdit}
                  onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                />
                <button 
                  className={`${styles.button} ${styles.primaryButton}`}
                  onClick={saveEdit}
                >
                  <CheckCircle size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <h2 className="text-xl font-semibold mr-2">{selectedProject.title}</h2>
                <button 
                  className="text-gray-500 hover:text-blue-500"
                  onClick={() => startEdit('project', selectedProject.id, selectedProject.title)}
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>

          {selectedProject.description && (
            <p className="text-gray-600 mb-3">{selectedProject.description}</p>
          )}

          <div className="mb-2">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">Progression globale</span>
              <span className="text-sm font-medium">{selectedProject.progress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressBarFill}
                style={{ 
                  width: `${selectedProject.progress}%`,
                  backgroundColor: 
                    selectedProject.progress < 30 ? '#f87171' :
                    selectedProject.progress < 70 ? '#facc15' : 
                    '#4ade80'
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Sections</h3>
          <button 
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={() => setIsAddingSection(true)}
          >
            <Plus size={16} className="mr-1" /> Ajouter une section
          </button>
        </div>

        {isAddingSection && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-3">Ajouter une nouvelle section</h3>
            <input
              type="text"
              placeholder="Titre de la section"
              className={`${styles.input} mb-3`}
              value={newSection.title}
              onChange={(e) => setNewSection({...newSection, title: e.target.value})}
            />
            <div className="flex justify-end space-x-2">
              <button 
                className={`${styles.button} ${styles.secondaryButton}`}
                onClick={() => {
                  setIsAddingSection(false);
                  setNewSection(empty_section());
                }}
              >
                Annuler
              </button>
              <button 
                className={`${styles.button} ${styles.primaryButton}`}
                onClick={handleAddSection}
              >
                Ajouter
              </button>
            </div>
          </div>
        )}

        {selectedProject.sections?.map(section => (
          <div key={section.id} className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
            <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
              {editMode.active && editMode.type === 'section' && editMode.id === section.id ? (
                <div className="flex items-center space-x-2 w-full">
                  <input
                    type="text"
                    className={styles.input}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                    onBlur={saveEdit}
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                  />
                  <button 
                    className={`${styles.button} ${styles.primaryButton}`}
                    onClick={saveEdit}
                  >
                    <CheckCircle size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <h4 className="font-medium mr-2">{section.title}</h4>
                  <button 
                    className="text-gray-500 hover:text-blue-500"
                    onClick={() => startEdit('section', section.id, section.title)}
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
              <div>
                <button 
                  className="text-gray-500 hover:text-red-500 ml-2"
                  onClick={() => handleDeleteSection(section.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <ul className="divide-y">
              {section.tasks?.map(task => (
                <li key={task.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(section.id, task.id)}
                      className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    
                    {editMode.active && editMode.type === 'task' && editMode.id === `${section.id}-${task.id}` ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          className={styles.input}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          autoFocus
                          onBlur={saveEdit}
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        />
                        <button 
                          className={`${styles.button} ${styles.primaryButton}`}
                          onClick={saveEdit}
                        >
                          <CheckCircle size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className={`${task.completed ? 'line-through text-gray-400' : ''}`}>
                        {task.title}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-1">
                    <button 
                      className="text-gray-500 hover:text-blue-500"
                      onClick={() => startEdit('task', `${section.id}-${task.id}`, task.title)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      className="text-gray-500 hover:text-red-500"
                      onClick={() => handleDeleteTask(section.id, task.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            
            {isAddingTask.active && isAddingTask.sectionId === section.id ? (
              <div className="p-3 border-t">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Nouvelle tâche"
                    className={`${styles.input} mr-2`}
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask(section.id)}
                  />
                  <div className="flex space-x-1">
                    <button 
                      className={`${styles.button} ${styles.secondaryButton}`}
                      onClick={() => setIsAddingTask({ active: false, sectionId: null })}
                    >
                      Annuler
                    </button>
                    <button 
                      className={`${styles.button} ${styles.primaryButton}`}
                      onClick={() => handleAddTask(section.id)}
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 border-t">
                <button 
                  className="flex items-center text-blue-500 hover:text-blue-700"
                  onClick={() => setIsAddingTask({ active: true, sectionId: section.id })}
                >
                  <PlusCircle size={16} className="mr-1" /> Ajouter une tâche
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard Personnel</h1>
        <p className={styles.subtitle}>Gérez vos projets et suivez votre progression</p>
      </header>
      
      <main>
        {selectedProject ? renderProjectView() : renderHomeView()}
      </main>
    </div>
  );
};

export default Dashboard;
