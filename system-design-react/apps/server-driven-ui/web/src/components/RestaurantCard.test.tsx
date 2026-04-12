import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RestaurantCard } from './RestaurantCard';

function renderWithRouter(ui: React.ReactNode) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('RestaurantCard', () => {
  const defaultProps = {
    id: '1',
    name: 'Sushi Palace',
    imageUrl: 'https://placehold.co/400x300?text=Sushi',
    rating: 4.5,
    deliveryTime: '25-35 min',
    cuisine: 'Japanese',
    priceRange: '$$',
    actions: [{ type: 'navigate' as const, payload: { to: '/restaurant/1' } }],
  };

  it('renders name, rating, delivery time, cuisine, and price range', () => {
    renderWithRouter(<RestaurantCard {...defaultProps} />);
    expect(screen.getByText('Sushi Palace')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('25-35 min')).toBeInTheDocument();
    expect(screen.getByText('Japanese')).toBeInTheDocument();
    expect(screen.getByText('$$')).toBeInTheDocument();
  });

  it('renders the restaurant image', () => {
    renderWithRouter(<RestaurantCard {...defaultProps} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://placehold.co/400x300?text=Sushi');
    expect(img).toHaveAttribute('alt', 'Sushi Palace');
  });

  it('links to the restaurant detail page', () => {
    renderWithRouter(<RestaurantCard {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/restaurant/1');
  });

  it('renders as a div when no navigate action', () => {
    renderWithRouter(<RestaurantCard {...defaultProps} actions={undefined} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Sushi Palace')).toBeInTheDocument();
  });
});
