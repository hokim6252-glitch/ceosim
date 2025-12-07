
import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { View } from '../types';
import { MENU_ITEMS } from '../constants';

interface NavigationContextType {
  activeView: View;
  setActiveView: Dispatch<SetStateAction<View>>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<View>(MENU_ITEMS[0].id);

  return (
    <NavigationContext.Provider value={{ activeView, setActiveView }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
