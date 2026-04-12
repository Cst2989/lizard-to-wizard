import { describe, it, expect } from 'vitest';
import { ComponentRegistry } from './ComponentRegistry';

const MockComponent = () => null;
const AnotherComponent = () => null;

describe('ComponentRegistry', () => {
  it('registers and retrieves a component', () => {
    const registry = new ComponentRegistry();
    registry.register('banner', MockComponent);
    expect(registry.get('banner')).toBe(MockComponent);
  });

  it('returns undefined for unregistered type', () => {
    const registry = new ComponentRegistry();
    expect(registry.get('unknown')).toBeUndefined();
  });

  it('reports whether a type is registered', () => {
    const registry = new ComponentRegistry();
    registry.register('banner', MockComponent);
    expect(registry.has('banner')).toBe(true);
    expect(registry.has('unknown')).toBe(false);
  });

  it('overwrites a previously registered component', () => {
    const registry = new ComponentRegistry();
    registry.register('banner', MockComponent);
    registry.register('banner', AnotherComponent);
    expect(registry.get('banner')).toBe(AnotherComponent);
  });
});
