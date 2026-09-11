import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface AnimatedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'pills' | 'underline';
}

export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  variant = 'pills',
}) => {
  return (
    <div
      className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar ${
        variant === 'pills' ? 'p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80' : 'border-b border-slate-200 pb-1'
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (variant === 'underline') {
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all whitespace-nowrap ${
                isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full transition-all duration-300" />
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              isActive
                ? 'bg-white text-teal-800 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
