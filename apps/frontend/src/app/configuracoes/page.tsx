'use client';

import { useReduxAuth } from '@/hooks/useReduxAuth';
import MainLayout from '@/components/templates/MainLayout/MainLayout';
import AISettings from '@/components/organisms/AISettings/AISettings';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ConfiguracoesPage() {
  const { user, isLoading, updateUser } = useReduxAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleUpdateUser = async (userData: any) => {
    try {
      await updateUser(userData);
      // Redirect back to home after saving
      router.push('/');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout user={user}>
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary-200 rounded mb-4"></div>
            <div className="h-4 bg-secondary-200 rounded mb-2"></div>
            <div className="h-4 bg-secondary-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-12 bg-secondary-200 rounded"></div>
              <div className="h-12 bg-secondary-200 rounded"></div>
              <div className="h-12 bg-secondary-200 rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <MainLayout user={user}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            Configurações
          </h1>
          <p className="text-secondary-600">
            Configure sua conta e integrações de IA
          </p>
        </div>
        
        <AISettings
          user={user}
          onUpdateUser={handleUpdateUser}
          isLoading={isLoading}
        />
      </div>
    </MainLayout>
  );
}
