import { Link } from 'react-router-dom';
import type { SDUIComponentProps } from '../core/types';
import styles from './Banner.module.css';

export function Banner({ imageUrl, title, subtitle, actions }: SDUIComponentProps) {
  const navigateAction = actions?.find((a) => a.type === 'navigate');
  const content = (
    <>
      <img
        className={styles.image}
        src={imageUrl as string}
        alt={title as string}
      />
      <div className={styles.overlay}>
        <p className={styles.title}>{title as string}</p>
        {subtitle && <p className={styles.subtitle}>{subtitle as string}</p>}
      </div>
    </>
  );

  if (navigateAction) {
    return (
      <Link className={styles.banner} to={navigateAction.payload.to as string}>
        {content}
      </Link>
    );
  }

  return <div className={styles.banner}>{content}</div>;
}
