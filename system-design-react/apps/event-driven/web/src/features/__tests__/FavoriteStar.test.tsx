import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FavoriteStar } from '../favorites/FavoriteStar';

describe('FavoriteStar', () => {
  it('should render an unfilled star when not favorite', () => {
    render(<FavoriteStar isFavorite={false} onToggle={vi.fn()} />);

    const button = screen.getByTestId('favorite-star');
    expect(button.textContent).toBe('\u2606');
  });

  it('should render a filled star when favorite', () => {
    render(<FavoriteStar isFavorite={true} onToggle={vi.fn()} />);

    const button = screen.getByTestId('favorite-star');
    expect(button.textContent).toBe('\u2605');
  });

  it('should call onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<FavoriteStar isFavorite={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByTestId('favorite-star'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should stop event propagation on click', () => {
    const onToggle = vi.fn();
    const onParentClick = vi.fn();

    render(
      <div onClick={onParentClick}>
        <FavoriteStar isFavorite={false} onToggle={onToggle} />
      </div>
    );

    fireEvent.click(screen.getByTestId('favorite-star'));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it('should have correct aria-label', () => {
    const { rerender } = render(<FavoriteStar isFavorite={false} onToggle={vi.fn()} />);
    expect(screen.getByTestId('favorite-star').getAttribute('aria-label')).toBe('Add to favorites');

    rerender(<FavoriteStar isFavorite={true} onToggle={vi.fn()} />);
    expect(screen.getByTestId('favorite-star').getAttribute('aria-label')).toBe('Remove from favorites');
  });
});
