import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfferBanner } from './OfferBanner';

describe('OfferBanner', () => {
  it('renders title and description', () => {
    render(
      <OfferBanner
        title="2 FOR 1 on all Italian food"
        description="This week only at Bella Napoli"
        offerType="2for1"
      />
    );
    expect(screen.getByText('2 FOR 1 on all Italian food')).toBeInTheDocument();
    expect(screen.getByText('This week only at Bella Napoli')).toBeInTheDocument();
  });

  it('renders the correct badge for 2for1 offer type', () => {
    render(
      <OfferBanner title="Deal" offerType="2for1" />
    );
    expect(screen.getByText('2 FOR 1')).toBeInTheDocument();
  });

  it('renders the correct badge for 50off offer type', () => {
    render(
      <OfferBanner title="Deal" offerType="50off" />
    );
    expect(screen.getByText('50% OFF')).toBeInTheDocument();
  });

  it('renders the correct badge for freeDelivery offer type', () => {
    render(
      <OfferBanner title="Deal" offerType="freeDelivery" />
    );
    expect(screen.getByText('FREE DELIVERY')).toBeInTheDocument();
  });

  it('applies custom background and text colors', () => {
    const { container } = render(
      <OfferBanner
        title="Colorful"
        offerType="50off"
        backgroundColor="#dc2626"
        textColor="#fef2f2"
      />
    );
    const banner = container.firstChild as HTMLElement;
    expect(banner.style.backgroundColor).toBe('rgb(220, 38, 38)');
    expect(banner.style.color).toBe('rgb(254, 242, 242)');
  });

  it('uses default colors when none are specified', () => {
    const { container } = render(
      <OfferBanner title="Default" offerType="2for1" />
    );
    const banner = container.firstChild as HTMLElement;
    expect(banner.style.backgroundColor).toBe('rgb(124, 58, 237)');
    expect(banner.style.color).toBe('rgb(255, 255, 255)');
  });

  it('renders without description', () => {
    render(
      <OfferBanner title="Title Only" offerType="50off" />
    );
    expect(screen.getByText('Title Only')).toBeInTheDocument();
  });
});
