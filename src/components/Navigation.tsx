import React from 'react';
import {
  Keyboard,
  Mouse,
  Monitor,
  Headphones,
  Gamepad2,
  ClipboardList
} from 'lucide-react';
import { ModuleTab } from '../types/hardware';

interface NavigationProps {
  activeTab: ModuleTab;
  passedModules: Set<ModuleTab>;
  historyCount: number;
  onSelectTab: (tab: ModuleTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  passedModules,
  historyCount,
  onSelectTab
}) => {
  const navItems: { id: ModuleTab; label: string; icon: React.ReactNode }[] = [
    { id: 'keyboard', label: 'Keyboard Diagnostic', icon: <Keyboard size={16} /> },
    { id: 'mouse', label: 'Mouse & Sensor', icon: <Mouse size={16} /> },
    { id: 'screen', label: 'Display & Monitor', icon: <Monitor size={16} /> },
    { id: 'media', label: 'Audio, Mic & Camera', icon: <Headphones size={16} /> },
    { id: 'gamepad', label: 'Controller & Axis', icon: <Gamepad2 size={16} /> },
    {
      id: 'history',
      label: `Batch Log (${historyCount})`,
      icon: <ClipboardList size={16} />
    }
  ];

  return (
    <nav className="nav-tabs">
      {navItems.map((item) => {
        const isPassed = passedModules.has(item.id);
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            className={`tab-btn ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
            onClick={() => onSelectTab(item.id)}
          >
            {item.id !== 'history' && <span className="tab-status-dot" />}
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
