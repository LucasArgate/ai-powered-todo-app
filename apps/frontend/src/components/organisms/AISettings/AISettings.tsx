import React from 'react';
import { User } from '@/types';
import Card from '@/components/atoms/Card/Card';
import Input from '@/components/atoms/Input/Input';
import Button from '@/components/atoms/Button/Button';

export interface AISettingsProps {
  user: User;
  onUpdateUser: (data: { aiIntegrationType?: 'huggingface' | 'openrouter'; aiToken?: string }) => void;
  isLoading?: boolean;
}

const AISettings: React.FC<AISettingsProps> = ({
  user,
  onUpdateUser,
  isLoading = false,
}) => {
  const [aiType, setAiType] = React.useState<'huggingface' | 'openrouter' | ''>(
    user.aiIntegrationType || ''
  );
  const [aiToken, setAiToken] = React.useState(user.aiToken || '');

  const handleSave = () => {
    onUpdateUser({
      aiIntegrationType: aiType as 'huggingface' | 'openrouter',
      aiToken: aiToken.trim() || undefined,
    });
  };

  const handleClear = () => {
    setAiType('');
    setAiToken('');
    onUpdateUser({
      aiIntegrationType: undefined,
      aiToken: undefined,
    });
  };

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
          AI Configuration
        </h3>
        <p className="text-sm text-secondary-600">
          Configure your AI provider to generate tasks automatically
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            AI Provider
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="aiType"
                value="huggingface"
                checked={aiType === 'huggingface'}
                onChange={(e) => setAiType(e.target.value as 'huggingface')}
                className="mr-2"
              />
              <span className="text-sm">Hugging Face</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="aiType"
                value="openrouter"
                checked={aiType === 'openrouter'}
                onChange={(e) => setAiType(e.target.value as 'openrouter')}
                className="mr-2"
              />
              <span className="text-sm">OpenRouter</span>
            </label>
          </div>
        </div>

        {aiType && (
          <Input
            label={`${aiType === 'huggingface' ? 'Hugging Face' : 'OpenRouter'} API Token`}
            type="password"
            value={aiToken}
            onChange={(e) => setAiToken(e.target.value)}
            placeholder={`Enter your ${aiType === 'huggingface' ? 'Hugging Face' : 'OpenRouter'} API token`}
            helperText={
              aiType === 'huggingface'
                ? 'Get your token from huggingface.co/settings/tokens'
                : 'Get your token from openrouter.ai/keys'
            }
          />
        )}

        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isLoading}
            disabled={!aiType || !aiToken.trim()}
          >
            Save Configuration
          </Button>
          <Button
            variant="ghost"
            onClick={handleClear}
            disabled={isLoading}
          >
            Clear
          </Button>
        </div>
      </div>

      {user.aiIntegrationType && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ AI configured with {user.aiIntegrationType === 'huggingface' ? 'Hugging Face' : 'OpenRouter'}
          </p>
        </div>
      )}
    </Card>
  );
};

export default AISettings;
