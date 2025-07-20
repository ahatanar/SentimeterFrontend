import React from 'react';
import { LucideIcon } from 'lucide-react';

const TabSwitcher = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          {tab.icon && <tab.icon className="h-4 w-4" />}
          <span className="font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabSwitcher; 