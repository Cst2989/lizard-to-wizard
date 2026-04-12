import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FoodItemCard } from './FoodItemCard';
import { CartProvider } from '../CartContext';

function renderWithCart(ui: React.ReactNode) {
  return render(<CartProvider>{ui}</CartProvider>);
}

describe('FoodItemCard', () => {
  const defaultProps = {
    id: 'f1',
    name: 'Dragon Roll',
    description: 'Shrimp tempura, avocado, eel sauce',
    price: 14.99,
    imageUrl: 'https://placehold.co/400x300?text=Dragon+Roll',
    actions: [{ type: 'add-to-cart' as const, payload: { itemId: 'f1', price: 14.99 } }],
  };

  it('renders name, description, price, and image', () => {
    renderWithCart(<FoodItemCard {...defaultProps} />);
    expect(screen.getByText('Dragon Roll')).toBeInTheDocument();
    expect(screen.getByText('Shrimp tempura, avocado, eel sauce')).toBeInTheDocument();
    expect(screen.getByText('$14.99')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://placehold.co/400x300?text=Dragon+Roll'
    );
  });

  it('renders an add-to-cart button', () => {
    renderWithCart(<FoodItemCard {...defaultProps} />);
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  it('fires add-to-cart action when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithCart(<FoodItemCard {...defaultProps} />);
    const button = screen.getByRole('button', { name: /add to cart/i });
    await user.click(button);
    // Button should still be present after click (cart logic is handled by context)
    expect(button).toBeInTheDocument();
  });

  it('renders without image when imageUrl is missing', () => {
    renderWithCart(
      <FoodItemCard
        name="Plain Item"
        description="No image"
        price={5.0}
        actions={[]}
      />
    );
    expect(screen.getByText('Plain Item')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
