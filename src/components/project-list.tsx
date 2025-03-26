'use client';

import React, { useContext, useEffect, useState } from 'react';
import Button from '@/components/button';
import { useProjects } from '@/contexts/project-context';
import { styles } from '@/app/styles';
import { Project, projects_sorted_by_last_modified_time } from '@/app/types';
import { FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { ProgressBar, Progression } from './progression';
import { Card, CardBody, CardHeader } from './card';

interface ProjectListProps {
  onDelete: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ onDelete }) => {
  const { projects } = useProjects();

  const [displayedProjects, setDisplayedProjects] = useState<Project[]>(projects)
  useEffect(
    () => setDisplayedProjects(projects_sorted_by_last_modified_time(projects)),
    [projects]
  )

  return (
    <div className={styles.gridLayout}>
      {displayedProjects.map((project: Project) => (
        <ProjectOverview key={project.id} project={project} onDelete={onDelete} />
      ))}
    </div>
  );
};

interface ProjectOverviewProps {
  key: string;
  project: Project;
  onDelete: (id: Project['id']) => void;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project, onDelete }) => {
  return (
    <Link href={'/projects/' + project.id}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <h3 className={styles.cardTitle}>{project.title}</h3>
            <Button
              preventDefault={true}
              variant='delete'
              onClick={(e) => onDelete(project.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
          {project.description && (
            <p className={styles.cardDescription}>{project.description}</p>
          )}
        </CardHeader>
        <CardBody>
          <Progression progress={project.progress} />

          <div className="mt-3 text-sm text-gray-600">
            <div className="flex items-center">
              <FileText size={14} className="mr-1" />
              <span>{project.sections?.flatMap(s => s.tasks).length || 0} tâche(s)</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}



export default ProjectList;