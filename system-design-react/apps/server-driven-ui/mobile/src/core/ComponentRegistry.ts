import type { ComponentType } from 'react';
import type { SDUIComponentProps } from './types';

export class ComponentRegistry {
  private components = new Map<string, ComponentType<SDUIComponentProps>>();

  register(type: string, component: ComponentType<SDUIComponentProps>): void {
    this.components.set(type, component);
  }

  get(type: string): ComponentType<SDUIComponentProps> | undefined {
    return this.components.get(type);
  }

  has(type: string): boolean {
    return this.components.has(type);
  }
}
