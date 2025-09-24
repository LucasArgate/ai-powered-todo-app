'use client';

import React from 'react';
import { useAuthContext } from '@/components/providers/AuthProvider';

export const AuthStatus: React.FC = () => {
  const { user, isLoading, error, isAuthenticated } = useAuthContext();

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-600">Inicializando autenticação...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Erro de Autenticação: {error}</p>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-600">
          ✅ Autenticado como {user.name || 'Usuário Anônimo'} (ID: {user.id})
        </p>
        <p className="text-sm text-green-500 mt-1">
          Usuário está {user.isAnonymous ? 'anônimo' : 'registrado'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-600">Não autenticado</p>
    </div>
  );
};
