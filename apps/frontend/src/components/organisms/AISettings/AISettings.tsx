import React from 'react';
import { User } from '@/types';
import Card from '@/components/atoms/Card/Card';
import Input from '@/components/atoms/Input/Input';
import Button from '@/components/atoms/Button/Button';
import { apiClient } from '@/lib/api';

export interface AISettingsProps {
  user: User;
  onUpdateUser: (data: { name?: string; aiIntegrationType?: 'huggingface' | 'openrouter'; aiToken?: string; aiModel?: string }) => void;
  isLoading?: boolean;
}

const AISettings: React.FC<AISettingsProps> = ({
  user,
  onUpdateUser,
  isLoading = false,
}) => {
  const [userName, setUserName] = React.useState(user.name || '');
  const [aiType, setAiType] = React.useState<'huggingface' | 'openrouter' | ''>(
    user.aiIntegrationType || ''
  );
  const [aiToken, setAiToken] = React.useState(user.aiToken || '');
  const [aiModel, setAiModel] = React.useState(user.aiModel || '');
  const [testResult, setTestResult] = React.useState<{
    valid: boolean;
    message: string;
    provider?: string;
    model?: string;
  } | null>(null);
  const [isTesting, setIsTesting] = React.useState(false);

  const handleSave = () => {
    onUpdateUser({
      name: userName.trim() || undefined,
      aiIntegrationType: aiType as 'huggingface' | 'openrouter',
      aiToken: aiToken.trim() || undefined,
      aiModel: aiModel.trim() || undefined,
    });
  };

  const handleClear = () => {
    setUserName('');
    setAiType('');
    setAiToken('');
    setAiModel('');
    setTestResult(null);
    onUpdateUser({
      name: undefined,
      aiIntegrationType: undefined,
      aiToken: undefined,
      aiModel: undefined,
    });
  };

  const handleTestApiKey = async () => {
    if (!aiToken.trim() || !aiType) {
      setTestResult({
        valid: false,
        message: 'Por favor, preencha o provedor e o token de API',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await apiClient.testApiKey(aiToken.trim(), aiType, aiModel.trim() || undefined);
      setTestResult(result);
    } catch (error: any) {
      setTestResult({
        valid: false,
        message: error.response?.data?.message || 'Erro ao testar API key',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
          Configuração de IA
        </h3>
        <p className="text-sm text-secondary-600">
          Configure seu provedor de IA para gerar tarefas automaticamente
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Input
            label="Nome do Usuário"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Digite seu nome"
            helperText="Deixe em branco para usar 'Usuário Anônimo'"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Provedor de IA
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
          <div className="space-y-4">
            <Input
              label={`${aiType === 'huggingface' ? 'Hugging Face' : 'OpenRouter'} API Token`}
              type="password"
              value={aiToken}
              onChange={(e) => setAiToken(e.target.value)}
              placeholder={`Digite seu token de API ${aiType === 'huggingface' ? 'Hugging Face' : 'OpenRouter'}`}
              helperText={
                aiType === 'huggingface'
                  ? 'Obtenha seu token em huggingface.co/settings/tokens'
                  : 'Obtenha seu token em openrouter.ai/keys'
              }
            />
            
            <Input
              label="Modelo"
              type="text"
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              placeholder={
                aiType === 'huggingface'
                  ? 'Ex: microsoft/DialoGPT-medium, mistralai/Mistral-7B-Instruct-v0.2'
                  : 'Ex: openai/gpt-3.5-turbo, anthropic/claude-3-haiku'
              }
              helperText={
                aiType === 'huggingface'
                  ? 'Modelos disponíveis: microsoft/DialoGPT-medium, microsoft/DialoGPT-large, facebook/blenderbot-400M-distill, mistralai/Mistral-7B-Instruct-v0.2'
                  : 'Modelos disponíveis: openai/gpt-3.5-turbo, anthropic/claude-3-haiku'
              }
            />
            
            <div className="mt-2">
              <Button
                variant="secondary"
                onClick={handleTestApiKey}
                isLoading={isTesting}
                disabled={isTesting || !aiToken.trim()}
                size="sm"
              >
                {isTesting ? 'Testando...' : 'Testar API Key'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Salvar Configuração
          </Button>
          <Button
            variant="ghost"
            onClick={handleClear}
            disabled={isLoading}
          >
            Limpar
          </Button>
        </div>
      </div>

      {testResult && (
        <div className={`mt-4 p-3 border rounded-lg ${
          testResult.valid 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm ${
            testResult.valid ? 'text-green-800' : 'text-red-800'
          }`}>
            {testResult.valid ? '✓' : '✗'} {testResult.message}
          </p>
        </div>
      )}

      {user.aiIntegrationType && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ IA configurada com {user.aiIntegrationType === 'huggingface' ? 'Hugging Face' : 'OpenRouter'}
          </p>
        </div>
      )}
    </Card>
  );
};

export default AISettings;
