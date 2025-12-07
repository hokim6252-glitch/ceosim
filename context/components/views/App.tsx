
import React, { useMemo } from 'react';
import { GameProvider } from './context/GameContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import { MENU_ITEMS } from './constants';

const AppContent: React.FC = () => {
  const { activeView } = useNavigation();

  const activeComponent = useMemo(() => {
    const menuItem = MENU_ITEMS.find(item => item.id === activeView);
    return menuItem ? menuItem.component : MENU_ITEMS[0].component;
  }, [activeView]);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-mono">
      <Sidebar />
      <MainContent activeViewId={activeView} ActiveComponent={activeComponent} />
    </div>
  );
};


const App: React.FC = () => {
  return (
    <GameProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </GameProvider>
  );
};

export default App;
