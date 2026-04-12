import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FoodItemRow } from './FoodItemRow';
import { CartProvider } from '../CartContext';

function renderWithCart(ui: React.ReactNode) {
  return render(<CartProvider>{ui}</CartProvider>);
}

describe('FoodItemRow', () => {
  const defaultProps = {
    id: 'f1',
    name: 'Dragon Roll',
    description: 'Shrimp tempura, avocado, eel sauce',
    price: 14.99,
    imageUrl: 'https://placehold.co/60x60?text=Dragon+Roll',
    actions: [{ type: 'add-to-cart' as const, payload: { itemId: 'f1', price: 14.99 } }],
  };

  it('renders name, description, price, and image', () => {
    renderWithCart(<FoodItemRow {...defaultProps} />);
    expect(screen.getByText('Dragon Roll')).toBeInTheDocument();
    expect(screen.getByText('Shrimp tempura, avocado, eel sauce')).toBeInTheDocument();
    expect(screen.getByText('$14.99')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://placehold.co/60x60?text=Dragon+Roll'
    );
  });

  it('renders an add button when add-to-cart action is present', () => {
    renderWithCart(<FoodItemRow {...defaultProps} />);
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('fires add-to-cart action when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithCart(<FoodItemRow {...defaultProps} />);
    const button = screen.getByRole('button', { name: /add/i });
    await user.click(button);
    expect(button).toBeInTheDocument();
  });

  it('renders without image when imageUrl is missing', () => {
    renderWithCart(
      <FoodItemRow
        name="Plain Item"
        description="No image"
        price={5.0}
        actions={[]}
      />
    );
    expect(screen.getByText('Plain Item')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('does not render add button when no add-to-cart action', () => {
    renderWithCart(
      <FoodItemRow
        name="View Only"
        price={10.0}
        actions={[]}
      />
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
