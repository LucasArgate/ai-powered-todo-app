import React, { useState } from 'react';
import { User } from '@/types';
import Card from '@/components/atoms/Card/Card';
import Button from '@/components/atoms/Button/Button';

export interface TaskPreview {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
}

export interface WelcomeCardProps {
  user: User | null;
  isLoading?: boolean;
  onCreateManualList: () => void;
  onConfigureAI: () => void;
  onGenerateWithAI: (prompt: string) => void;
  onGeneratePreview: (prompt: string) => Promise<TaskPreview[]>;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({
  user,
  isLoading = false,
  onCreateManualList,
  onConfigureAI,
  onGenerateWithAI,
}) => {
  const [aiPrompt, setAiPrompt] = useState('planejar uma viagem para o Japão');

  const handleGenerateWithAI = async () => {
    if (aiPrompt.trim()) {
      await onGenerateWithAI(aiPrompt.trim());
      setAiPrompt('planejar uma viagem para o Japão'); // Reset to default
    }
  };

  const isAIConfigured = user?.aiIntegrationType && user?.aiToken;

  return (
    <Card className="text-center py-6">
      <div className="flex items-center justify-center mb-4">
        {isAIConfigured ? (
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-sm font-medium">IA Configurada</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-orange-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium">Configure a IA</span>
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-secondary-900 mb-3">
        Bem-vindo ao Smart Todo List
      </h3>
      
      <p className="text-secondary-600 mb-4 text-sm">
        {isAIConfigured 
          ? "A IA está pronta! Crie listas manualmente ou deixe a IA gerá-las automaticamente baseado em seus objetivos."
          : "Crie listas de tarefas manualmente ou configure a IA para gerá-las automaticamente baseado em seus objetivos."
        }
      </p>
      
      {isAIConfigured ? (
        <div className="space-y-3">
          <div className="text-left">
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              O que você gostaria de planejar?
            </label>
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ex: planejar uma viagem para o Japão"
            />
          </div>
          <Button
            variant="primary"
            onClick={handleGenerateWithAI}
            className="w-full"
            size="sm"
            isLoading={isLoading}
            disabled={!aiPrompt.trim() || isLoading}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Criar com IA
          </Button>
          <Button
            variant="secondary"
            onClick={onCreateManualList}
            className="w-full"
            size="sm"
          >
            Criar Lista Manual
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Button
            variant="primary"
            onClick={onCreateManualList}
            className="w-full"
            size="sm"
          >
            Criar Lista Manual
          </Button>
          <Button
            variant="primary"
            onClick={onConfigureAI}
            className="w-full"
            size="sm"
          >
            Configurar IA
          </Button>
        </div>
      )}
    </Card>
  );
};

export default WelcomeCard;
