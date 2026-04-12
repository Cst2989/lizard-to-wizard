import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminPanel } from './AdminPanel';
import { getAdminConfig, resetAdminConfig } from './adminState';

describe('AdminPanel', () => {
  beforeEach(() => {
    resetAdminConfig();
  });

  it('renders config selectors for home and restaurants', () => {
    render(<AdminPanel />);
    expect(screen.getByText('Layout & Banner Position')).toBeInTheDocument();
    expect(screen.getByText('Sushi Palace (Restaurant 1)')).toBeInTheDocument();
    expect(screen.getByText('Bella Napoli (Restaurant 2)')).toBeInTheDocument();
  });

  it('renders the JSON preview section', () => {
    render(<AdminPanel />);
    expect(screen.getByText('Active JSON Preview')).toBeInTheDocument();
  });

  it('switches the home config when selecting a variant', async () => {
    const user = userEvent.setup();
    render(<AdminPanel />);
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'home-promo.json');
    expect(getAdminConfig().home).toBe('home-promo.json');
  });

  it('switches the restaurant 1 config when selecting a variant', async () => {
    const user = userEvent.setup();
    render(<AdminPanel />);
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[1], 'restaurant-1-v2.json');
    expect(getAdminConfig().restaurants['1']).toBe('restaurant-1-v2.json');
  });

  it('switches the restaurant 2 config when selecting a variant', async () => {
    const user = userEvent.setup();
    render(<AdminPanel />);
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[2], 'restaurant-2-v2.json');
    expect(getAdminConfig().restaurants['2']).toBe('restaurant-2-v2.json');
  });
});
