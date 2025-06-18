import React from 'react';
import { Home, History, BarChart3, Settings, Calendar } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'workout', label: 'Treino', icon: Home },
    { id: 'management', label: 'Gerenciar', icon: Calendar },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Config', icon: Settings }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-blue-500 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;