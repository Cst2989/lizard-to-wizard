import type { SDUIComponentProps } from '../core/types';
import styles from './ListLayout.module.css';

export function ListLayout({ children }: SDUIComponentProps) {
  return <div className={styles.list}>{children}</div>;
}
