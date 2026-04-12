import { useContext } from 'react';
import { CartContext } from '../CartContext';
import styles from './CartSummary.module.css';

export function CartSummary() {
  const { items, total } = useContext(CartContext);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (itemCount === 0) return null;

  return (
    <div className={styles.summary}>
      <span className={styles.count}>
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </span>
      <span>${total.toFixed(2)}</span>
    </div>
  );
}
