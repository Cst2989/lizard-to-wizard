import styles from './FavoriteStar.module.css';

interface FavoriteStarProps {
  isFavorite: boolean;
  onToggle: () => void;
}

export function FavoriteStar({ isFavorite, onToggle }: FavoriteStarProps) {
  return (
    <button
      className={isFavorite ? styles.active : styles.inactive}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      data-testid="favorite-star"
    >
      {isFavorite ? '\u2605' : '\u2606'}
    </button>
  );
}
