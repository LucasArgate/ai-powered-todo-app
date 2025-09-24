import React from 'react';
import { Task } from '@/types';
import Checkbox from '@/components/atoms/Checkbox/Checkbox';
import Button from '@/components/atoms/Button/Button';

export interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string, isCompleted: boolean) => void;
  onDelete: (taskId: string) => void;
  onEdit?: (taskId: string, newTitle: string) => void;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
}) => {
  const [editTitle, setEditTitle] = React.useState(task.title);

  React.useEffect(() => {
    setEditTitle(task.title);
  }, [task.title]);

  const handleSaveEdit = () => {
    if (onEdit && editTitle.trim() !== task.title) {
      onEdit(task.id, editTitle.trim());
    }
    onCancelEdit?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditTitle(task.title);
      onCancelEdit?.();
    }
  };

  return (
    <div className={`flex items-center gap-3 p-3 bg-white border border-secondary-200 rounded-lg transition-colors ${
      task.isCompleted ? 'bg-secondary-50' : 'hover:bg-secondary-50'
    }`}>
      <Checkbox
        checked={task.isCompleted}
        onChange={(e) => onToggleComplete(task.id, e.target.checked)}
        className="flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleSaveEdit}
            className="w-full px-2 py-1 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
        ) : (
          <span
            className={`block text-sm ${
              task.isCompleted
                ? 'text-secondary-500 line-through'
                : 'text-secondary-900'
            }`}
            onDoubleClick={onStartEdit}
          >
            {task.title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button
              size="sm"
              variant="primary"
              onClick={handleSaveEdit}
              className="px-2 py-1"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditTitle(task.title);
                onCancelEdit?.();
              }}
              className="px-2 py-1"
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            {onStartEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onStartEdit}
                className="px-2 py-1 text-xs"
              >
                Edit
              </Button>
            )}
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(task.id)}
              className="px-2 py-1 text-xs"
            >
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
