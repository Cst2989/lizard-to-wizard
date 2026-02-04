// Typing indicator animation

import './TypingIndicator.css';

interface TypingIndicatorProps {
  names: string[];
}

export function TypingIndicator({ names }: TypingIndicatorProps) {
  if (names.length === 0) return null;

  const text = names.length === 1
    ? `${names[0]} is typing`
    : names.length === 2
    ? `${names[0]} and ${names[1]} are typing`
    : `${names[0]} and ${names.length - 1} others are typing`;

  return (
    <div className="typing-indicator" role="status" aria-live="polite">
      <div className="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span className="typing-text">{text}</span>
    </div>
  );
}
