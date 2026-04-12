import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SDUIRenderer } from './SDUIRenderer';
import { ComponentRegistry } from './ComponentRegistry';
import type { SDUINode, SDUIComponentProps } from './types';

function TestBanner({ title, children }: SDUIComponentProps) {
  return (
    <div data-testid="banner">
      <span>{title as string}</span>
      {children}
    </div>
  );
}

function TestGrid({ children }: SDUIComponentProps) {
  return <div data-testid="grid">{children}</div>;
}

function createRegistry(): ComponentRegistry {
  const registry = new ComponentRegistry();
  registry.register('banner', TestBanner);
  registry.register('grid', TestGrid);
  return registry;
}

describe('SDUIRenderer', () => {
  it('renders a single node using the registry', () => {
    const node: SDUINode = {
      type: 'banner',
      props: { title: 'Hello' },
    };
    render(<SDUIRenderer node={node} registry={createRegistry()} />);
    expect(screen.getByTestId('banner')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders nested children recursively', () => {
    const node: SDUINode = {
      type: 'grid',
      children: [
        { type: 'banner', props: { title: 'Child 1' } },
        { type: 'banner', props: { title: 'Child 2' } },
      ],
    };
    render(<SDUIRenderer node={node} registry={createRegistry()} />);
    expect(screen.getByTestId('grid')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('renders null for unknown types', () => {
    const node: SDUINode = { type: 'unknown-widget' };
    const { container } = render(
      <SDUIRenderer node={node} registry={createRegistry()} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('passes actions to the component', () => {
    const node: SDUINode = {
      type: 'banner',
      props: { title: 'Promo' },
      actions: [{ type: 'navigate', payload: { to: '/deals' } }],
    };

    function ActionBanner({ actions }: SDUIComponentProps) {
      return <div data-testid="action-banner">{actions?.[0]?.type}</div>;
    }

    const registry = new ComponentRegistry();
    registry.register('banner', ActionBanner);

    render(<SDUIRenderer node={node} registry={registry} />);
    expect(screen.getByTestId('action-banner')).toHaveTextContent('navigate');
  });
});
