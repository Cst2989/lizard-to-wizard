import type { SDUIComponentProps } from '../core/types';
import styles from './OfferBanner.module.css';

const OFFER_LABELS: Record<string, string> = {
  '2for1': '2 FOR 1',
  '50off': '50% OFF',
  freeDelivery: 'FREE DELIVERY',
};

export function OfferBanner({
  title,
  description,
  offerType,
  backgroundColor,
  textColor,
}: SDUIComponentProps) {
  const badge = OFFER_LABELS[(offerType as string) ?? ''] ?? (offerType as string);

  return (
    <div
      className={styles.banner}
      style={{
        backgroundColor: (backgroundColor as string) ?? '#7c3aed',
        color: (textColor as string) ?? '#ffffff',
      }}
    >
      <span className={styles.badge}>{badge}</span>
      <div className={styles.content}>
        <p className={styles.title}>{title as string}</p>
        {description && (
          <p className={styles.description}>{description as string}</p>
        )}
      </div>
    </div>
  );
}
