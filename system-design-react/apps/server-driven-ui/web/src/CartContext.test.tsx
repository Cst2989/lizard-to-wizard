import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';
import { CartProvider, CartContext } from './CartContext';

function CartTestHarness() {
  const { items, total, addItem, removeItem, updateQuantity } = useContext(CartContext);
  return (
    <div>
      <span data-testid="total">{total.toFixed(2)}</span>
      <span data-testid="count">{items.length}</span>
      <ul>
        {items.map((item) => (
          <li key={item.itemId} data-testid={`item-${item.itemId}`}>
            {item.name} x{item.quantity}
            <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)}>+</button>
            <button onClick={() => removeItem(item.itemId)}>remove</button>
          </li>
        ))}
      </ul>
      <button
        data-testid="add-dragon"
        onClick={() =>
          addItem({ itemId: 'f1', name: 'Dragon Roll', price: 14.99, quantity: 1 })
        }
      >
        Add Dragon
      </button>
      <button
        data-testid="add-salmon"
        onClick={() =>
          addItem({ itemId: 'f2', name: 'Salmon Nigiri', price: 9.99, quantity: 1 })
        }
      >
        Add Salmon
      </button>
    </div>
  );
}

describe('CartContext', () => {
  it('starts with an empty cart', () => {
    render(
      <CartProvider>
        <CartTestHarness />
      </CartProvider>
    );
    expect(screen.getByTestId('total')).toHaveTextContent('0.00');
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('adds an item to the cart', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartTestHarness />
      </CartProvider>
    );
    await user.click(screen.getByTestId('add-dragon'));
    expect(screen.getByTestId('total')).toHaveTextContent('14.99');
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('increments quantity when adding the same item again', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartTestHarness />
      </CartProvider>
    );
    await user.click(screen.getByTestId('add-dragon'));
    await user.click(screen.getByTestId('add-dragon'));
    expect(screen.getByTestId('total')).toHaveTextContent('29.98');
    expect(screen.getByTestId('item-f1')).toHaveTextContent('Dragon Roll x2');
  });

  it('removes an item from the cart', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartTestHarness />
      </CartProvider>
    );
    await user.click(screen.getByTestId('add-dragon'));
    await user.click(screen.getByText('remove'));
    expect(screen.getByTestId('total')).toHaveTextContent('0.00');
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('updates item quantity', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartTestHarness />
      </CartProvider>
    );
    await user.click(screen.getByTestId('add-dragon'));
    await user.click(screen.getByText('+'));
    expect(screen.getByTestId('total')).toHaveTextContent('29.98');
    expect(screen.getByTestId('item-f1')).toHaveTextContent('Dragon Roll x2');
  });

  it('calculates total across multiple items', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartTestHarness />
      </CartProvider>
    );
    await user.click(screen.getByTestId('add-dragon'));
    await user.click(screen.getByTestId('add-salmon'));
    expect(screen.getByTestId('total')).toHaveTextContent('24.98');
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });
});
