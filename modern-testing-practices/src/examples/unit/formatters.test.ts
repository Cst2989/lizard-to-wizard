// Unit Tests for formatters - Solution
import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  truncateText,
  slugify,
  isValidEmail,
} from './formatters';

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats EUR when specified', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
  });

  it('handles large numbers', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });
});

describe('formatDate', () => {
  it('formats date in en-US locale', () => {
    const date = new Date('2024-03-15');
    expect(formatDate(date)).toBe('March 15, 2024');
  });

  it('handles different locales', () => {
    const date = new Date('2024-03-15');
    // Note: Results may vary by environment
    expect(formatDate(date, 'en-US')).toContain('March');
  });
});

describe('truncateText', () => {
  it('returns text unchanged if shorter than maxLength', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('truncates with ellipsis when text exceeds maxLength', () => {
    expect(truncateText('Hello World', 8)).toBe('Hello...');
  });

  it('handles exact length', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });

  it('handles empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });
});

describe('slugify', () => {
  it('converts to lowercase and replaces spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('handles multiple spaces', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });

  it('trims whitespace', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world');
  });

  it('handles already slugified text', () => {
    expect(slugify('hello-world')).toBe('hello-world');
  });
});

describe('isValidEmail', () => {
  it('returns true for valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user.name@example.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  it('returns false for invalid emails', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user @example.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});
