import React from 'react';
import { Home, History, BarChart3, Settings, Calendar } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'workout', label: 'Início', icon: Home },
    { id: 'management', label: 'Treinos', icon: Calendar },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Ajustes', icon: Settings }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-bg-primary/95 backdrop-blur-lg border-t border-white/10">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all w-16 h-16
                  ${
                    isActive
                      ? 'bg-primary-gradient text-white shadow-lg'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
              >
                <Icon className="w-5 h-5 mb-1" />
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