// Avatar component with status indicator

import type { User } from '../../types';
import './Avatar.css';

interface AvatarProps {
  user: User | undefined;
  size?: 'small' | 'medium' | 'large';
  showStatus?: boolean;
}

export function Avatar({ user, size = 'medium', showStatus = true }: AvatarProps) {
  if (!user) {
    return (
      <div className={`avatar avatar-${size} avatar-placeholder`}>
        <span>?</span>
      </div>
    );
  }

  return (
    <div className={`avatar avatar-${size}`}>
      <img src={user.avatar} alt={user.name} />
      {showStatus && (
        <span className={`avatar-status avatar-status-${user.status}`} />
      )}
    </div>
  );
}
