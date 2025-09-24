import React from 'react';
import { User } from '@/types';
import { Settings } from 'lucide-react';
import Link from 'next/link';

export interface MainLayoutProps {
  children: React.ReactNode;
  user: User | null;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  user,
}) => {
  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
                Smart Todo List
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="text-sm text-secondary-600">
                  {user.name || 'Usuário Anônimo'}
                </div>
              )}
              <Link
                href="/configuracoes"
                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                title="Configurações"
              >
                <Settings size={16} />
                Configurações
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-secondary-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-secondary-500">
            Smart Todo List - Alimentado por IA<br />
            <span className="text-xs">Feito com carinho por Lucas Argate</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
