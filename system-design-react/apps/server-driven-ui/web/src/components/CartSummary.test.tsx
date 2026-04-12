import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';
import { CartProvider, CartContext } from '../CartContext';
import { CartSummary } from './CartSummary';

function AddItemButton() {
  const { addItem } = useContext(CartContext);
  return (
    <button
      data-testid="add"
      onClick={() =>
        addItem({ itemId: 'f1', name: 'Roll', price: 10.0, quantity: 1 })
      }
    >
      Add
    </button>
  );
}

describe('CartSummary', () => {
  it('shows nothing when cart is empty', () => {
    const { container } = render(
      <CartProvider>
        <CartSummary />
      </CartProvider>
    );
    expect(container.querySelector('[class*="summary"]')).not.toBeInTheDocument();
  });

  it('shows item count and total when cart has items', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <AddItemButton />
        <CartSummary />
      </CartProvider>
    );
    await user.click(screen.getByTestId('add'));
    expect(screen.getByText('1 item')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('pluralizes items correctly', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <AddItemButton />
        <CartSummary />
      </CartProvider>
    );
    await user.click(screen.getByTestId('add'));
    await user.click(screen.getByTestId('add'));
    expect(screen.getByText('2 items')).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument();
  });
});
