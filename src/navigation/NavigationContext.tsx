'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  activeRoute: string;
  setActiveRoute: (route: string) => void;
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
}

interface Breadcrumb {
  name: string;
  href: string;
  current: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [activeRoute, setActiveRoute] = useState<string>('');
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

  const value = {
    activeRoute,
    setActiveRoute,
    breadcrumbs,
    setBreadcrumbs,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}
