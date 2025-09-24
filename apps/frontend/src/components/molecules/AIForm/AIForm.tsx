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
          Generate Tasks with AI
        </h3>
        <p className="text-sm text-secondary-600">
          Describe your goal and let AI create actionable tasks for you
        </p>
      </div>

      {!hasAIConfiguration && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-2">
            You need to configure your AI provider first.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={onConfigureAI}
          >
            Configure AI Settings
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="List Name"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder="e.g., Plan My Vacation"
          disabled={isLoading || !hasAIConfiguration}
          required
        />

        <Textarea
          label="Describe your goal"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Plan a 10-day trip to Japan including flights, hotels, and activities"
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
          {isLoading ? 'Generating Tasks...' : 'Generate Tasks with AI'}
        </Button>
      </form>

      {hasAIConfiguration && (
        <div className="mt-3 text-xs text-secondary-500 text-center">
          Using {aiIntegrationType === 'huggingface' ? 'Hugging Face' : 'OpenRouter'} AI
        </div>
      )}
    </Card>
  );
};

export default AIForm;
