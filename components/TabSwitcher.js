import React from 'react';
import { LucideIcon } from 'lucide-react';

const TabSwitcher = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex w-full max-w-md mx-auto mb-4 rounded-lg overflow-hidden border border-purple-700/30 bg-gradient-to-r from-gray-900/60 to-blue-900/60">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex flex-col items-center justify-center px-0 py-1.5 transition-all duration-200 font-medium text-sm focus:outline-none
            ${activeTab === tab.id
              ? 'bg-purple-600 text-white z-10'
              : 'bg-transparent text-gray-300 hover:bg-purple-700/20 hover:text-white'}
          `}
          style={{ minWidth: 0 }}
        >
          {tab.icon && <tab.icon className={`h-4 w-4 mb-0.5 ${activeTab === tab.id ? 'text-white' : 'text-purple-300'}`} />}
          <span className="tracking-wide">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabSwitcher; 