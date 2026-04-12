import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Banner } from './Banner';

function renderWithRouter(ui: React.ReactNode) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('Banner', () => {
  it('renders image, title, and subtitle', () => {
    renderWithRouter(
      <Banner
        imageUrl="https://placehold.co/800x300?text=Thai+Food"
        title="50% off Thai Food"
        subtitle="This weekend only"
      />
    );
    expect(screen.getByText('50% off Thai Food')).toBeInTheDocument();
    expect(screen.getByText('This weekend only')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://placehold.co/800x300?text=Thai+Food'
    );
  });

  it('renders without subtitle', () => {
    renderWithRouter(
      <Banner
        imageUrl="https://placehold.co/800x300?text=Banner"
        title="Simple Banner"
      />
    );
    expect(screen.getByText('Simple Banner')).toBeInTheDocument();
  });

  it('navigates when clicked with a navigate action', async () => {
    renderWithRouter(
      <Banner
        imageUrl="https://placehold.co/800x300?text=Promo"
        title="Promo"
        actions={[{ type: 'navigate', payload: { to: '/restaurant/3' } }]}
      />
    );

    const banner = screen.getByRole('link');
    expect(banner).toHaveAttribute('href', '/restaurant/3');
  });

  it('renders as a div when there is no navigate action', () => {
    renderWithRouter(
      <Banner
        imageUrl="https://placehold.co/800x300?text=Static"
        title="Static Banner"
      />
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
