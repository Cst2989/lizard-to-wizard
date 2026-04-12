import type { SDUIComponentProps } from './types';

export class ComponentRegistry {
  private components = new Map<string, React.ComponentType<SDUIComponentProps>>();

  register(type: string, component: React.ComponentType<SDUIComponentProps>): void {
    this.components.set(type, component);
  }

  get(type: string): React.ComponentType<SDUIComponentProps> | undefined {
    return this.components.get(type);
  }

  has(type: string): boolean {
    return this.components.has(type);
  }
}
