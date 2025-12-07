
import React from 'react';
import { View } from '../types';

interface MainContentProps {
  activeViewId: View;
  ActiveComponent: React.FC;
}

const MainContent: React.FC<MainContentProps> = ({ ActiveComponent }) => {
  return (
    <main className="flex-1 p-6 bg-gray-800 overflow-y-auto">
      <ActiveComponent />
    </main>
  );
};

export default MainContent;
