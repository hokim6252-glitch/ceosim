import React from 'react';
import { MENU_ITEMS } from '../constants';
import { useNavigation } from '../context/NavigationContext';

const Sidebar: React.FC = () => {
  const { activeView, setActiveView } = useNavigation();

  return (
    <nav className="w-64 bg-gray-900 border-r border-gray-700 p-4 flex flex-col h-full overflow-y-auto">
      <h1 className="text-2xl font-bold text-cyan-400 mb-6">CEO SIM</h1>
      <ul className="space-y-2">
        {MENU_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => setActiveView(item.id)}
              className={`w-full text-left flex items-center p-2 rounded-lg transition-colors duration-200 ${
                activeView === item.id
                  ? 'bg-cyan-500 text-white'
                  : 'hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="w-6 h-6 mr-3">{item.icon}</span>
              {item.name}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-4 text-xs text-gray-500">
        <p>&copy; 2025 Your Company</p>
        <p>Version 0.1.0</p>
      </div>
    </nav>
  );
};

export default Sidebar;
