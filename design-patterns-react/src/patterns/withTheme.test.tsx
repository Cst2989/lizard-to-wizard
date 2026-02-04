/**
 * Tests for Decorator Pattern (HOC)
 * 
 * The Decorator pattern attaches additional responsibilities
 * to an object dynamically, providing a flexible alternative to subclassing.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { withTheme, WithThemeProps } from './withTheme-task';

// Test component that receives theme props
const TestComponent: React.FC<WithThemeProps & { testId?: string }> = ({ 
  theme, 
  toggleTheme, 
  testId = 'test' 
}) => (
  <div data-testid={testId}>
    <span data-testid="theme-value">{theme}</span>
    <button data-testid="toggle-btn" onClick={toggleTheme}>Toggle</button>
  </div>
);

describe('Decorator Pattern - withTheme HOC', () => {
  let WrappedComponent: React.FC<{ testId?: string }>;

  beforeEach(() => {
    // Create wrapped component
    WrappedComponent = withTheme(TestComponent);
    // Clean up document classes
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  describe('HOC Structure', () => {
    it('should return a component', () => {
      expect(typeof WrappedComponent).toBe('function');
    });

    it('should render the wrapped component', () => {
      render(<WrappedComponent testId="wrapped" />);
      expect(screen.getByTestId('wrapped')).toBeInTheDocument();
    });

    it('should pass through original props', () => {
      render(<WrappedComponent testId="custom-id" />);
      expect(screen.getByTestId('custom-id')).toBeInTheDocument();
    });
  });

  describe('Theme Props', () => {
    it('should provide theme prop to wrapped component', () => {
      render(<WrappedComponent />);
      expect(screen.getByTestId('theme-value')).toBeInTheDocument();
    });

    it('should start with light theme', () => {
      render(<WrappedComponent />);
      expect(screen.getByTestId('theme-value').textContent).toBe('light');
    });

    it('should provide toggleTheme function', () => {
      render(<WrappedComponent />);
      expect(screen.getByTestId('toggle-btn')).toBeInTheDocument();
    });
  });

  describe('Toggle Theme Functionality', () => {
    it('should toggle from light to dark', () => {
      render(<WrappedComponent />);
      
      fireEvent.click(screen.getByTestId('toggle-btn'));
      
      expect(screen.getByTestId('theme-value').textContent).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      render(<WrappedComponent />);
      
      fireEvent.click(screen.getByTestId('toggle-btn')); // light -> dark
      fireEvent.click(screen.getByTestId('toggle-btn')); // dark -> light
      
      expect(screen.getByTestId('theme-value').textContent).toBe('light');
    });

    it('should add dark class to document when theme is dark', () => {
      render(<WrappedComponent />);
      
      fireEvent.click(screen.getByTestId('toggle-btn'));
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should remove dark class from document when theme is light', () => {
      render(<WrappedComponent />);
      
      fireEvent.click(screen.getByTestId('toggle-btn')); // add dark
      fireEvent.click(screen.getByTestId('toggle-btn')); // remove dark
      
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('Multiple Wrapped Components', () => {
    it('should allow wrapping different components', () => {
      const AnotherComponent: React.FC<WithThemeProps> = ({ theme }) => (
        <div data-testid="another">{theme}</div>
      );
      
      const WrappedAnother = withTheme(AnotherComponent);
      render(<WrappedAnother />);
      
      expect(screen.getByTestId('another')).toBeInTheDocument();
      expect(screen.getByTestId('another').textContent).toBe('light');
    });
  });
});

/**
 * WORKSHOP INSTRUCTIONS:
 * 
 * Implement the Decorator pattern in withTheme-task.tsx
 * 
 * Key concepts:
 * 1. HOC wraps a component and adds functionality
 * 2. Original props are passed through
 * 3. Additional props (theme, toggleTheme) are injected
 * 
 * Implementation:
 * 1. Create theme state with useState ('light' | 'dark')
 * 2. Create toggleTheme function with useCallback
 *    - Toggle between 'light' and 'dark'
 *    - Add/remove 'dark' class from document.documentElement
 * 3. Initialize theme on mount with useEffect
 * 4. Return wrapped component with spread props + theme + toggleTheme
 */
