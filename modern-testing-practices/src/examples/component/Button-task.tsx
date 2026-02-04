// Button Component - TASK
// Implement this component to make the tests pass!
import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  // TODO: Build the className string
  // It should include:
  // - 'btn' (always)
  // - `btn-${variant}` (e.g., 'btn-primary')
  // - `btn-${size}` (e.g., 'btn-medium')
  // - 'btn-full-width' (if fullWidth is true)
  // - 'btn-loading' (if loading is true)
  // - the custom className prop
  const classNames = 'btn'; // TODO: Fix this

  // TODO: Return a button element with:
  // - The correct className
  // - disabled when disabled OR loading
  // - aria-busy set to loading value
  // - Show loading spinner and "Loading..." text when loading
  // - Show children when not loading
  // - Spread the rest of the props

  return (
    <button className={classNames} {...props}>
      {children}
    </button>
  );
}
