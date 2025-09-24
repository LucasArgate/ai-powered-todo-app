import React from 'react';
import Input from '@/components/atoms/Input/Input';
import Textarea from '@/components/atoms/Textarea/Textarea';
import Button from '@/components/atoms/Button/Button';
import Card from '@/components/atoms/Card/Card';

export interface AIFormProps {
  onSubmit: (listName: string, prompt: string) => void;
  isLoading?: boolean;
  aiIntegrationType?: 'huggingface' | 'openrouter';
  onConfigureAI?: () => void;
}

const AIForm: React.FC<AIFormProps> = ({
  onSubmit,
  isLoading = false,
  aiIntegrationType,
  onConfigureAI,
}) => {
  const [listName, setListName] = React.useState('');
  const [prompt, setPrompt] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (listName.trim() && prompt.trim()) {
      onSubmit(listName.trim(), prompt.trim());
      setListName('');
      setPrompt('');
    }
  };

  const hasAIConfiguration = aiIntegrationType;

  return (
    <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-primary-900 mb-2">
          Gerar Tarefas com IA
        </h3>
        <p className="text-sm text-secondary-600">
          Descreva seu objetivo e deixe a IA criar tarefas acionáveis para você
        </p>
      </div>

      {!hasAIConfiguration && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-2">
            Você precisa configurar seu provedor de IA primeiro.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={onConfigureAI}
          >
            Configurar IA
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome da Lista"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder="ex.: Planejar Minhas Férias"
          disabled={isLoading || !hasAIConfiguration}
          required
        />

        <Textarea
          label="Descreva seu objetivo"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="ex.: Planejar uma viagem de 10 dias ao Japão incluindo voos, hotéis e atividades"
          rows={3}
          disabled={isLoading || !hasAIConfiguration}
          required
        />

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!listName.trim() || !prompt.trim() || !hasAIConfiguration}
          className="w-full"
        >
          {isLoading ? 'Gerando Tarefas...' : 'Gerar Tarefas com IA'}
        </Button>
      </form>

      {hasAIConfiguration && (
        <div className="mt-3 text-xs text-secondary-500 text-center">
          Usando IA {aiIntegrationType === 'huggingface' ? 'Hugging Face' : 'OpenRouter'}
        </div>
      )}
    </Card>
  );
};

export default AIForm;
