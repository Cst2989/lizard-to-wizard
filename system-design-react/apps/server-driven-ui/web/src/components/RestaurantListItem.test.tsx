import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RestaurantListItem } from './RestaurantListItem';

function renderWithRouter(ui: React.ReactNode) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('RestaurantListItem', () => {
  const defaultProps = {
    id: '1',
    name: 'Sushi Palace',
    imageUrl: 'https://placehold.co/80x80?text=Sushi',
    rating: 4.5,
    deliveryTime: '25-35 min',
    cuisine: 'Japanese',
    priceRange: '$$',
    actions: [{ type: 'navigate' as const, payload: { to: '/restaurant/1' } }],
  };

  it('renders name, rating, delivery time, cuisine, and price range', () => {
    renderWithRouter(<RestaurantListItem {...defaultProps} />);
    expect(screen.getByText('Sushi Palace')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('25-35 min')).toBeInTheDocument();
    expect(screen.getByText('Japanese')).toBeInTheDocument();
    expect(screen.getByText('$$')).toBeInTheDocument();
  });

  it('renders the restaurant image with correct dimensions', () => {
    renderWithRouter(<RestaurantListItem {...defaultProps} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://placehold.co/80x80?text=Sushi');
    expect(img).toHaveAttribute('alt', 'Sushi Palace');
  });

  it('links to the restaurant detail page when navigate action is present', () => {
    renderWithRouter(<RestaurantListItem {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/restaurant/1');
  });

  it('renders as a div when no navigate action is provided', () => {
    renderWithRouter(<RestaurantListItem {...defaultProps} actions={undefined} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Sushi Palace')).toBeInTheDocument();
  });

  it('renders in a horizontal layout with separators between meta items', () => {
    renderWithRouter(<RestaurantListItem {...defaultProps} />);
    const separators = screen.getAllByText('|');
    expect(separators.length).toBe(3);
  });
});
