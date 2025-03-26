import { styles } from "@/app/styles";
import { CheckCircle, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Task as TaskType, toggle_task } from "@/app/types";
import Button from "./button";

interface TaskProps {
    task: TaskType;
    onDelete: (id: TaskType['id']) => void;
    onUpdateTask: (task: TaskType) => void;
}

const Task: React.FC<TaskProps> = ({ task, onDelete, onUpdateTask }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editText, setEditText] = useState('');

    const startEdit = async (currentText: string) => {
        setIsEditing(true)
        setEditText(currentText)
    };

    const saveEdit = async () => {
        if ((editText?.trim() ?? '') === '') {
            setIsEditing(false)
            return;
        }

        if (task.title === editText) return;

        task.title = editText
        onUpdateTask(task)
        setIsEditing(false)
    };

    const handleToggleTask = async () => {
        onUpdateTask(toggle_task(task))
    };

    return (
        <li key={task.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask()}
                    className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />

                {isEditing ? (
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            className={styles.input}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            autoFocus
                            onBlur={saveEdit}
                            onKeyUp={(e) => e.key === 'Enter' && saveEdit()}
                        />
                        <Button
                            variant="primary"
                            onClick={saveEdit}
                        >
                            <CheckCircle size={16} />
                        </Button>
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
                    onClick={() => startEdit(task.title)}
                >
                    <Edit2 size={14} />
                </button>
                <button
                    className="text-gray-500 hover:text-red-500"
                    onClick={() => onDelete(task.id)}
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </li>
    );
};

export default Task;
