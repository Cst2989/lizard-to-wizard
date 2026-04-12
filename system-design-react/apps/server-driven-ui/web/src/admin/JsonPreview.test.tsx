import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JsonPreview } from './JsonPreview';

describe('JsonPreview', () => {
  it('renders JSON content in a preformatted block', () => {
    const data = { type: 'banner', props: { title: 'Hello' } };
    render(<JsonPreview data={data} />);
    expect(screen.getByText(/"type": "banner"/)).toBeInTheDocument();
    expect(screen.getByText(/"title": "Hello"/)).toBeInTheDocument();
  });

  it('renders a title', () => {
    render(<JsonPreview data={{ type: 'list' }} title="Active Config" />);
    expect(screen.getByText('Active Config')).toBeInTheDocument();
  });
});
