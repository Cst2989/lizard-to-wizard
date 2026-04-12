import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigSelector } from './ConfigSelector';

describe('ConfigSelector', () => {
  it('renders a label and dropdown with variants', () => {
    render(
      <ConfigSelector
        label="Home Page"
        value="home.json"
        variants={['home.json', 'home-v2.json', 'home-promo.json']}
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('calls onChange when a variant is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ConfigSelector
        label="Home Page"
        value="home.json"
        variants={['home.json', 'home-v2.json', 'home-promo.json']}
        onChange={onChange}
      />
    );
    await user.selectOptions(screen.getByRole('combobox'), 'home-promo.json');
    expect(onChange).toHaveBeenCalledWith('home-promo.json');
  });

  it('displays the current value as selected', () => {
    render(
      <ConfigSelector
        label="Home Page"
        value="home-v2.json"
        variants={['home.json', 'home-v2.json', 'home-promo.json']}
        onChange={() => {}}
      />
    );
    expect(screen.getByRole('combobox')).toHaveValue('home-v2.json');
  });
});
