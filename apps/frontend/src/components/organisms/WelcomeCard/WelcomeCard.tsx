import React, { useState } from 'react';
import { User } from '@/types';
import Card from '@/components/atoms/Card/Card';
import Button from '@/components/atoms/Button/Button';
import Link from 'next/link';

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
  onGenerateWithAI: (prompt: string, listName?: string, listDescription?: string) => void;
  onGeneratePreview: (prompt: string) => Promise<{ listName: string; listDescription: string; tasks: TaskPreview[] }>;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({
  user,
  isLoading = false,
  onCreateManualList,
  onGenerateWithAI,
  onGeneratePreview,
}) => {
  const [aiPrompt, setAiPrompt] = useState('planejar uma viagem para o Japão');
  const [previewData, setPreviewData] = useState<{ listName: string; listDescription: string; tasks: TaskPreview[] } | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleGeneratePreview = async () => {
    if (aiPrompt.trim()) {
      setIsGeneratingPreview(true);
      try {
        const data = await onGeneratePreview(aiPrompt.trim());
        setPreviewData(data);
        setShowPreview(true);
      } catch (error) {
        console.error('Erro ao gerar preview:', error);
      } finally {
        setIsGeneratingPreview(false);
      }
    }
  };

  const handleApplyPreview = async () => {
    if (previewData) {
      // Use the generated title and description from preview
      await onGenerateWithAI(aiPrompt.trim(), previewData.listName, previewData.listDescription);
      setAiPrompt('planejar uma viagem para o Japão'); // Reset to default
      setShowPreview(false);
      setPreviewData(null);
    }
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setPreviewData(null);
  };

  const handleGenerateNewPreview = () => {
    setShowPreview(false);
    setPreviewData(null);
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
        showPreview ? (
          <div className="space-y-4">
            <div className="text-left">
              <h4 className="text-sm font-medium text-secondary-900 mb-3">
                Preview das tarefas geradas:
              </h4>
              
              {/* List Title and Description */}
              {previewData && (
                <div className="mb-4 p-3 bg-primary-50 rounded-md border border-primary-200">
                  <h5 className="text-sm font-semibold text-primary-900 mb-1">
                    {previewData.listName}
                  </h5>
                  {previewData.listDescription && (
                    <p className="text-xs text-primary-700">
                      {previewData.listDescription}
                    </p>
                  )}
                </div>
              )}
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {previewData?.tasks.map((task, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-secondary-50 rounded-md">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-secondary-600 mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                        {task.category && (
                          <span className="text-xs text-secondary-500">{task.category}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Button
                variant="primary"
                onClick={handleApplyPreview}
                className="w-full"
                size="sm"
                isLoading={isLoading}
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Aplicar e Criar Lista
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={handleGenerateNewPreview}
                  className="flex-1"
                  size="sm"
                  disabled={isGeneratingPreview}
                >
                  Gerar Novo
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleCancelPreview}
                  className="flex-1"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        ) : (
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
                disabled={isGeneratingPreview}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleGeneratePreview}
              className="w-full"
              size="sm"
              isLoading={isGeneratingPreview}
              disabled={!aiPrompt.trim() || isGeneratingPreview}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Gerar Preview
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
        )
      ) : (
        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            onClick={onCreateManualList}
            className="w-full"
            size="sm"
          >
            Criar Lista Manual
          </Button>
          <Link href="/configuracoes" className="w-full">
            <Button
              variant="secondary"
              className="w-full"
              size="sm"
            >
              Configurar IA
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
};

export default WelcomeCard;
