import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GridLayout } from './GridLayout';

describe('GridLayout', () => {
  it('renders children in a grid container', () => {
    render(
      <GridLayout columns={2}>
        <div data-testid="child-1">A</div>
        <div data-testid="child-2">B</div>
      </GridLayout>
    );
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('applies the grid class', () => {
    const { container } = render(
      <GridLayout columns={3}>
        <div>A</div>
      </GridLayout>
    );
    const grid = container.firstElementChild;
    expect(grid?.className).toContain('grid');
  });

  it('defaults to 2 columns when not specified', () => {
    const { container } = render(
      <GridLayout>
        <div>A</div>
      </GridLayout>
    );
    const grid = container.firstElementChild as HTMLElement;
    expect(grid.style.getPropertyValue('--columns')).toBe('2');
  });
});
