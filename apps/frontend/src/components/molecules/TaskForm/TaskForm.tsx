import React from 'react';
import Input from '@/components/atoms/Input/Input';
import Button from '@/components/atoms/Button/Button';

export interface TaskFormProps {
  onSubmit: (title: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  placeholder = 'Adicionar nova tarefa...',
  isLoading = false,
}) => {
  const [title, setTitle] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
        disabled={isLoading}
      />
      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        disabled={!title.trim()}
      >
        Adicionar
      </Button>
    </form>
  );
};

export default TaskForm;
