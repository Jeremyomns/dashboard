'use client';

import React, { useState } from 'react';
import Task from './task';
import { Section as SectionType, Task as TaskType, empty_task, section_with_new_task, section_with_updated_task, section_without_task } from '@/app/types';
import Button from './button';
import { CheckCircle, Edit2, PlusCircle, Trash2 } from 'lucide-react';
import { styles } from '@/app/styles';

interface SectionProps {
    section: SectionType;
    onUpdateSection: (section: SectionType) => void;
    onDeleteSection: (id: SectionType['id']) => void;
}

export default function Section({ section, onDeleteSection, onUpdateSection }: SectionProps) {
    const [newTask, setNewTask] = useState(empty_task());
    const [isAddingTask, setIsAddingTask] = useState<{ active: boolean, sectionId: string | null }>({ active: false, sectionId: null });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editText, setEditText] = useState('');
    const [isLoading, setLoading] = useState(true)

    const handleAddTask = async () => {
        if (!newTask.title.trim()) return;
        const newId = Math.max(0, ...section.tasks?.map(t => +(t.id.split('-').pop() ?? '0')) ?? []) + 1;
        section = section_with_new_task(section, {
            ...newTask,
            id: section.id + '-' + newId.toString(),
            section_id: section.id
        })
        onUpdateSection(section)
        setIsAddingTask({ active: false, sectionId: null });
        setNewTask(empty_task())
    };
    if (!section) return (<p>Section not found.</p>);

    const startEdit = (currentText: string) => {
        setIsEditing(true);
        setEditText(currentText);
    };

    const saveEdit = async () => {
        if ((editText?.trim() ?? '') === '') {
            setIsEditing(false);
            return;
        }

        if(section.title === editText) return;

        section.title = editText
        setIsEditing(false);
        onUpdateSection(section)
    };

    const handleDeleteTask = async (taskId: string) => {
        section = section_without_task(section, taskId);
        onUpdateSection(section)
    };

    const handleUpdateTask = async (task: TaskType) => {
        section = section_with_updated_task(section, task);
        onUpdateSection(section)
    }

    return (
        <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
            <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
                {isEditing ? (
                    <div className="flex items-center space-x-2 w-full">
                        <input
                            type="text"
                            className={styles.input}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            autoFocus
                            onBlur={saveEdit}
                            onKeyUp={(e) => e.key === 'Enter' && saveEdit()}
                        />
                        <Button variant='primary' onClick={saveEdit}>
                            <CheckCircle size={16} />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center">
                        <h4 className="font-medium mr-2">{section.title}</h4>
                        <Button
                            variant='edit'
                            onClick={() => startEdit(section.title)}
                        >
                            <Edit2 size={14} />
                        </Button>
                    </div>
                )}
                <div>
                    <Button
                        variant='delete'
                        onClick={() => onDeleteSection(section.id)}
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>

            <ul className="divide-y">
                {section.tasks?.map(task => (
                    <Task key={task.id} task={task}
                        onDelete={handleDeleteTask}
                        onUpdateTask={handleUpdateTask}
                    ></Task>
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
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            onKeyUp={(e) => e.key === 'Enter' && handleAddTask()}
                        />
                        <div className="flex space-x-1">
                            <Button
                                variant='secondary'
                                onClick={() => setIsAddingTask({ active: false, sectionId: null })}
                            >
                                Annuler
                            </Button>
                            <Button
                               variant='primary'
                                onClick={() => handleAddTask()}
                            >
                                Ajouter
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-3 border-t">
                    <Button
                        classes="flex items-center text-blue-500 hover:text-blue-700"
                        onClick={() => setIsAddingTask({ active: true, sectionId: section.id })}
                    >
                        <PlusCircle size={16} className="mr-1" /> Ajouter une tâche
                    </Button>
                </div>
            )}
        </div>
    )
};