import styles from './FavoritesFilter.module.css';

interface FavoritesFilterProps {
  active: boolean;
  onToggle: () => void;
}

export function FavoritesFilter({ active, onToggle }: FavoritesFilterProps) {
  return (
    <div className={styles.filter}>
      <button
        className={active ? styles.toggleActive : styles.toggle}
        onClick={onToggle}
        data-testid="favorites-filter"
      >
        {'\u2605'} Favorites Only
      </button>
    </div>
  );
}
