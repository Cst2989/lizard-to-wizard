// patterns/withTheme.tsx - Decorator Pattern (HOC) Implementation

import React, { useState, useCallback, useEffect } from 'react';

// Props that the decorator adds to wrapped components
export interface WithThemeProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Higher-Order Component that decorates a component with theme functionality
export const withTheme = <P extends object>(Component: React.ComponentType<P & WithThemeProps>) => {
  return (props: P) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const toggleTheme = useCallback(() => {
      setTheme(prevTheme => {
        const newTheme = prevTheme === 'light' ? 'dark' : 'light';
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return newTheme;
      });
    }, []);

    // Initialize theme on mount
    useEffect(() => {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, []);

    return <Component {...props} theme={theme} toggleTheme={toggleTheme} />;
  };
};
