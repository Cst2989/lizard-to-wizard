import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimeSlider } from '../timeline/TimeSlider';

// Mock the API client
vi.mock('../../api/client', () => ({
  fetchMatchEvents: vi.fn().mockResolvedValue([]),
}));

describe('TimeSlider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the time slider', () => {
    render(<TimeSlider matchId="m1" maxMinute={67} />);

    expect(screen.getByTestId('time-slider')).toBeDefined();
    expect(screen.getByText('Time Travel')).toBeDefined();
  });

  it('should display the current minute', () => {
    render(<TimeSlider matchId="m1" maxMinute={67} />);

    expect(screen.getByText("67'")).toBeDefined();
  });

  it('should render a range input', () => {
    render(<TimeSlider matchId="m1" maxMinute={90} />);

    const slider = screen.getByRole('slider');
    expect(slider).toBeDefined();
    expect(slider.getAttribute('min')).toBe('0');
    expect(slider.getAttribute('max')).toBe('90');
  });

  it('should show minute markers', () => {
    render(<TimeSlider matchId="m1" maxMinute={90} />);

    expect(screen.getByText("0'")).toBeDefined();
    expect(screen.getByText("45'")).toBeDefined();
    // "90'" appears both as current minute and as a marker
    expect(screen.getAllByText("90'").length).toBeGreaterThanOrEqual(1);
  });
});
