import { describe, it, expect } from 'vitest';
import { isSDUINode, isSDUIAction } from './types';

describe('isSDUINode', () => {
  it('returns true for a valid node with only type', () => {
    expect(isSDUINode({ type: 'banner' })).toBe(true);
  });

  it('returns true for a node with props, children, and actions', () => {
    const node = {
      type: 'grid',
      props: { columns: 2 },
      children: [{ type: 'banner' }],
      actions: [{ type: 'navigate', payload: { to: '/home' } }],
    };
    expect(isSDUINode(node)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isSDUINode(null)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isSDUINode('banner')).toBe(false);
  });

  it('returns false for an object without type', () => {
    expect(isSDUINode({ props: {} })).toBe(false);
  });

  it('returns false for an object where type is not a string', () => {
    expect(isSDUINode({ type: 42 })).toBe(false);
  });
});

describe('isSDUIAction', () => {
  it('returns true for a valid action', () => {
    expect(isSDUIAction({ type: 'navigate', payload: { to: '/home' } })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isSDUIAction(null)).toBe(false);
  });

  it('returns false when payload is missing', () => {
    expect(isSDUIAction({ type: 'navigate' })).toBe(false);
  });

  it('returns false when type is not a string', () => {
    expect(isSDUIAction({ type: 123, payload: {} })).toBe(false);
  });
});
