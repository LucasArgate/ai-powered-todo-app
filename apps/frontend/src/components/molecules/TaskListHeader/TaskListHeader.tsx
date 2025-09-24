import React from 'react';
import Button from '@/components/atoms/Button/Button';
import { TaskList } from '@/types';

export interface TaskListHeaderProps {
  taskList: TaskList;
  onEdit?: (taskList: TaskList) => void;
  onDelete?: (taskListId: string) => void;
  isEditing?: boolean;
  onSaveEdit?: (name: string, description?: string) => void;
  onCancelEdit?: () => void;
}

const TaskListHeader: React.FC<TaskListHeaderProps> = ({
  taskList,
  onEdit,
  onDelete,
  isEditing = false,
  onSaveEdit,
  onCancelEdit,
}) => {
  const [editName, setEditName] = React.useState(taskList.name);
  const [editDescription, setEditDescription] = React.useState(taskList.description || '');

  React.useEffect(() => {
    setEditName(taskList.name);
    setEditDescription(taskList.description || '');
  }, [taskList.name, taskList.description]);

  const handleSaveEdit = () => {
    if (onSaveEdit) {
      onSaveEdit(editName.trim(), editDescription.trim() || undefined);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditName(taskList.name);
      setEditDescription(taskList.description || '');
      onCancelEdit?.();
    }
  };

  return (
    <div className="bg-white border-b border-secondary-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full text-xl font-semibold px-2 py-1 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Adicionar uma descrição..."
                className="w-full text-sm text-secondary-600 px-2 py-1 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows={2}
              />
            </div>
          ) : (
            <div>
              <h1 className="text-xl font-semibold text-secondary-900 mb-1">
                {taskList.name}
              </h1>
              {taskList.description && (
                <p className="text-sm text-secondary-600 mb-2">
                  {taskList.description}
                </p>
              )}
              {taskList.iaPrompt && (
                <div className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded">
                  Gerado a partir de: "{taskList.iaPrompt}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="primary"
                onClick={handleSaveEdit}
              >
                Salvar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditName(taskList.name);
                  setEditDescription(taskList.description || '');
                  onCancelEdit?.();
                }}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <>
              {onEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(taskList)}
                >
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDelete(taskList.id)}
                >
                  Excluir Lista
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskListHeader;
