import React, { ReactNode } from 'react';

interface StatProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  size?: 'sm' | 'md';
}

const Stat: React.FC<StatProps> = ({ label, value, icon, size = 'md' }) => {
  if (size === 'sm') {
    return (
      <div className="flex items-center space-x-2 px-2">
        {icon && <div className="text-cyan-400 text-lg w-5 h-5 flex-shrink-0">{icon}</div>}
        <div>
          <div className="text-xs text-gray-400">{label}</div>
          <div className="text-base font-bold text-white whitespace-nowrap">{value}</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg flex items-center">
      {icon && <div className="text-cyan-400 mr-4 text-2xl">{icon}</div>}
      <div>
        <div className="text-sm text-gray-400">{label}</div>
        <div className="text-xl font-bold text-white">{value}</div>
      </div>
    </div>
  );
};

export default Stat;
