import { Link } from 'react-router-dom';
import type { SDUIComponentProps } from '../core/types';
import styles from './RestaurantCard.module.css';

export function RestaurantCard({
  name,
  imageUrl,
  rating,
  deliveryTime,
  cuisine,
  priceRange,
  actions,
}: SDUIComponentProps) {
  const navigateAction = actions?.find((a) => a.type === 'navigate');

  const content = (
    <>
      <img
        className={styles.image}
        src={imageUrl as string}
        alt={name as string}
      />
      <div className={styles.info}>
        <p className={styles.name}>{name as string}</p>
        <div className={styles.meta}>
          <span className={styles.rating}>{String(rating)}</span>
          <span>{deliveryTime as string}</span>
          <span>{cuisine as string}</span>
          <span>{priceRange as string}</span>
        </div>
      </div>
    </>
  );

  if (navigateAction) {
    return (
      <Link className={styles.card} to={navigateAction.payload.to as string}>
        {content}
      </Link>
    );
  }

  return <div className={styles.card}>{content}</div>;
}
