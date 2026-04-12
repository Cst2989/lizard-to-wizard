import type { SDUIComponentProps } from '../core/types';
import styles from './GridLayout.module.css';

export function GridLayout({ columns = 2, children }: SDUIComponentProps) {
  return (
    <div
      className={styles.grid}
      style={{ '--columns': String(columns) } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
