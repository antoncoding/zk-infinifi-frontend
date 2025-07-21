'use client';

import React, { createContext, useContext, ReactNode } from 'react';

type AppContextType = {
  // Add any app-wide state or functions here
  version: string;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AppContext.Provider value={{ version: '1.0.0' }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 