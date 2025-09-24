import React from 'react';
import { User } from '@/types';

export interface MainLayoutProps {
  children: React.ReactNode;
  user: User | null;
  onConfigureAI?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  user,
  onConfigureAI,
}) => {
  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">
                Smart Todo List
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="text-sm text-secondary-600">
                  {user.name || 'Anonymous User'}
                </div>
              )}
              {onConfigureAI && (
                <button
                  onClick={onConfigureAI}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  AI Settings
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-secondary-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-secondary-500">
            Smart Todo List - Powered by AI
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
