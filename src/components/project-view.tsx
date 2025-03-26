'use client'

import { useProjects } from '@/contexts/project-context';
import Button from '@/components/button';
import Link from 'next/link';
import { styles } from '@/app/styles';
import { empty_project, empty_section, get_project_in_projects_by_id, Project, project_with_new_section, project_with_updated_section, project_without_section, Section as SectionType } from '@/app/types';
import { CheckCircle, Edit2, Home, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import Section from './section';
import { ProgressBar, Progression } from './progression';

interface ProjectViewProps {
  projectId: string;
}

const ProjectView: React.FC<ProjectViewProps> = ({ projectId }) => {
  const { projects, saveProject } = useProjects();

  const [project, setProject] = useState<Project>(empty_project())
  const [isEditing, setEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState('');
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddingSection, setIsAddingSection] = useState(false);

  useEffect(() => {
    setProject(get_project_in_projects_by_id(projects, projectId) ?? empty_project())
  }, [projects])

  const try_save_project = async (project: Project) => {
    setLoading(true)
    try {
      await saveProject(project).finally(() => setLoading(false))
    } catch (e) {
      setError('Error lors de la modification.')
      return
    }
  }

  const startEdit = (currentText: string) => {
    setEditing(true)
    setEditText(currentText);
  };

  const saveEdit = async () => {
    if ((editText?.trim() ?? '') === '') {
      setEditing(false);
      return;
    }

    if (project.title === editText) return;

    project.title = editText
    project.lastModifiedTime = new Date()

    await try_save_project(project)
    setEditing(false);
  };



  const handleUpdateSection = async (section: SectionType) => {
    await try_save_project(project_with_updated_section(project, section))
  }

  const handleDeleteSection = async (sectionId: string) => {
    await try_save_project(project_without_section(project, sectionId))
  }

  const handleAddSection = async (section: SectionType) => {
    // assume ids are int
    const newId = Math.max(0, ...projects.flatMap(p => p.sections?.map(s => +(s.id.split('-').pop() ?? '0')) ?? [])) + 1;
    const section_to_add: SectionType = {
      id: project.id + '-' + newId.toString(),
      title: section.title,
      tasks: [],
      project_id: project.id,
    }

    await try_save_project(project_with_new_section(project, section_to_add))
    setIsAddingSection(false);
  }

  return (
    <div className="p-4">
      <Link href='/'>
        <Button
          variant='secondary'
          classes={['mb-4']}
        >
          <Home size={16} className="mr-1" /> Retour aux projets
        </Button>
      </Link>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          {isEditing ? (
            <div className="flex items-center space-x-2 w-full">
              <input
                type="text"
                className={styles.input}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
                onKeyUp={(e) => e.key === 'Enter' && saveEdit()}
              />
              <Button variant='primary' onClick={saveEdit}>
                <CheckCircle size={16} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              <h2 className="text-xl font-semibold mr-2">{project.title}</h2>
              <Button
                variant='edit'
                onClick={() => startEdit(project.title)}
              >
                <Edit2 size={16} />
              </Button>
            </div>
          )}
        </div>

        {project.description && (
          <p className="text-gray-600 mb-3">{project.description}</p>
        )}

        <Progression progress={project.progress} />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Sections</h3>
        <Button
          variant='primary'
          onClick={() => setIsAddingSection(true)}
        >
          <Plus size={16} className="mr-1" /> Ajouter une section
        </Button>
      </div>

      {isAddingSection && (
        <AddSectionForm
          onAddSection={handleAddSection}
          onCancel={() => setIsAddingSection(false)}
        />
      )}

      {project.sections?.map(section => (
        <Section key={section.id} section={section}
          onUpdateSection={handleUpdateSection}
          onDeleteSection={handleDeleteSection}
        ></Section>
      ))}
    </div>
  );
};

interface AddSectionFormProps {
  onAddSection: (section: SectionType) => void;
  onCancel: () => void;
}

const AddSectionForm: React.FC<AddSectionFormProps> = ({ onAddSection, onCancel }) => {
  const [newSection, setNewSection] = useState<SectionType>(empty_section());

  const handleAddSection = async () => {
    if (newSection.title.trim() === '') return;
    onAddSection(newSection)
    setNewSection(empty_section());
  };

  const handleCancel = async () => {
    setNewSection(empty_section());
    onCancel()
  };

  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow">
      <h3 className="font-medium mb-3">Ajouter une nouvelle section</h3>
      <input
        type="text"
        placeholder="Titre de la section"
        className={`${styles.input} mb-3`}
        value={newSection.title}
        onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
      />
      <div className="flex justify-end space-x-2">
        <Button
          variant='secondary'
          onClick={handleCancel}
        >
          Annuler
        </Button>
        <Button
          variant='primary'
          onClick={handleAddSection}
        >
          Ajouter
        </Button>
      </div>
    </div>
  )
}



export default ProjectView;
