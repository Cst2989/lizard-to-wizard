// patterns/withTheme-task.tsx - Decorator Pattern (HOC) Implementation
// TODO: Implement a Higher-Order Component that adds theme functionality

import React, { useState, useCallback, useEffect } from 'react';

// Props that the decorator adds to wrapped components
export interface WithThemeProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// TODO: Implement the withTheme Higher-Order Component
// This HOC should:
// 1. Wrap a component and add theme and toggleTheme props
// 2. Manage theme state ('light' | 'dark')
// 3. Toggle between light and dark by adding/removing 'dark' class on document.documentElement
// 4. Initialize theme on mount

export const withTheme = <P extends object>(Component: React.ComponentType<P & WithThemeProps>) => {
  return (props: P) => {
    // TODO: Create theme state
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // TODO: Implement toggleTheme function using useCallback
    // Should toggle between 'light' and 'dark'
    // Should add/remove 'dark' class from document.documentElement
    const toggleTheme = useCallback(() => {
      // TODO: Implement toggle logic
    }, []);

    // TODO: Initialize theme on mount using useEffect

    // TODO: Return wrapped component with theme and toggleTheme props
    return <Component {...props} theme={theme} toggleTheme={toggleTheme} />;
  };
};
