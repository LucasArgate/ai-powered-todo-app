import React from 'react';
import { TaskList as TaskListType } from '@/types';
import Card from '@/components/atoms/Card/Card';
import Button from '@/components/atoms/Button/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner/LoadingSpinner';

export interface TaskListSelectorProps {
  taskLists: TaskListType[];
  currentTaskListId?: string;
  isLoading?: boolean;
  onSelectTaskList: (taskList: TaskListType) => void;
  onCreateNewList: () => void;
  onDeleteTaskList?: (taskListId: string) => void;
}

const TaskListSelector: React.FC<TaskListSelectorProps> = ({
  taskLists,
  currentTaskListId,
  isLoading = false,
  onSelectTaskList,
  onCreateNewList,
  onDeleteTaskList,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-secondary-900">Your Task Lists</h2>
        <Button
          variant="primary"
          size="sm"
          onClick={onCreateNewList}
        >
          New List
        </Button>
      </div>

      {taskLists.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-secondary-500 mb-4">No task lists yet.</p>
          <Button
            variant="primary"
            onClick={onCreateNewList}
          >
            Create Your First List
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {taskLists.map((taskList) => (
            <Card
              key={taskList.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                currentTaskListId === taskList.id
                  ? 'ring-2 ring-primary-500 bg-primary-50'
                  : 'hover:bg-secondary-50'
              }`}
              onClick={() => onSelectTaskList(taskList)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-secondary-900 mb-1">
                    {taskList.name}
                  </h3>
                  {taskList.description && (
                    <p className="text-sm text-secondary-600 mb-2">
                      {taskList.description}
                    </p>
                  )}
                  {taskList.iaPrompt && (
                    <div className="text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded">
                      AI Generated
                    </div>
                  )}
                  <p className="text-xs text-secondary-500 mt-2">
                    Created {new Date(taskList.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {onDeleteTaskList && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTaskList(taskList.id);
                    }}
                    className="ml-2"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskListSelector;
