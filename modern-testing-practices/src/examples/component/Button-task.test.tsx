// Component Tests for Button - TASK VERSION
// These tests should FAIL until you implement Button-task.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button-task';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with text content', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('applies variant classes correctly', () => {
      const { rerender } = render(<Button variant="primary">Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-primary');

      rerender(<Button variant="secondary">Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-secondary');

      rerender(<Button variant="danger">Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-danger');
    });

    it('applies size classes correctly', () => {
      const { rerender } = render(<Button size="small">Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-small');

      rerender(<Button size="medium">Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-medium');

      rerender(<Button size="large">Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-large');
    });

    it('applies full width class when fullWidth is true', () => {
      render(<Button fullWidth>Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-full-width');
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Click me</Button>);

      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} loading>Click me</Button>);

      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('States', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Button</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('is disabled when loading', () => {
      render(<Button loading>Button</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('shows loading text when loading', () => {
      render(<Button loading>Submit</Button>);
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('has aria-busy when loading', () => {
      render(<Button loading>Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Accessibility', () => {
    it('can be focused with keyboard', async () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');

      await userEvent.tab();
      expect(button).toHaveFocus();
    });

    it('can be activated with Enter key', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Button</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await userEvent.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be activated with Space key', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Button</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await userEvent.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
