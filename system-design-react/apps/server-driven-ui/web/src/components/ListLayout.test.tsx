import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListLayout } from './ListLayout';

describe('ListLayout', () => {
  it('renders children in a vertical list', () => {
    render(
      <ListLayout>
        <div data-testid="item-1">A</div>
        <div data-testid="item-2">B</div>
      </ListLayout>
    );
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
  });

  it('applies the list class', () => {
    const { container } = render(
      <ListLayout>
        <div>A</div>
      </ListLayout>
    );
    const list = container.firstElementChild;
    expect(list?.className).toContain('list');
  });
});
