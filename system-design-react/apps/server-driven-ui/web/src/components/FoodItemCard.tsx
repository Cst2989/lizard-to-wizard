import { useContext } from 'react';
import type { SDUIComponentProps } from '../core/types';
import { CartContext } from '../CartContext';
import styles from './FoodItemCard.module.css';

export function FoodItemCard({
  name,
  description,
  price,
  imageUrl,
  actions,
}: SDUIComponentProps) {
  const { addItem } = useContext(CartContext);
  const addToCartAction = actions?.find((a) => a.type === 'add-to-cart');

  function handleAddToCart() {
    if (!addToCartAction) return;
    addItem({
      itemId: addToCartAction.payload.itemId as string,
      name: name as string,
      price: addToCartAction.payload.price as number,
      quantity: 1,
    });
  }

  return (
    <div className={styles.card}>
      {imageUrl && (
        <img
          className={styles.image}
          src={imageUrl as string}
          alt={name as string}
        />
      )}
      <div className={styles.info}>
        <p className={styles.name}>{name as string}</p>
        {description && (
          <p className={styles.description}>{description as string}</p>
        )}
        <div className={styles.footer}>
          <span className={styles.price}>
            ${(price as number).toFixed(2)}
          </span>
          {addToCartAction && (
            <button className={styles.addButton} onClick={handleAddToCart}>
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
