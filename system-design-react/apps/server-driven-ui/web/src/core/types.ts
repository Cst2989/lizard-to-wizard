export interface SDUIAction {
  type: string;
  payload: Record<string, unknown>;
}

export interface SDUINode {
  type: string;
  props?: Record<string, unknown>;
  children?: SDUINode[];
  actions?: SDUIAction[];
}

export type ComponentMap = Map<string, React.ComponentType<SDUIComponentProps>>;

export interface SDUIComponentProps {
  actions?: SDUIAction[];
  children?: React.ReactNode;
  [key: string]: unknown;
}

export function isSDUINode(value: unknown): value is SDUINode {
  if (value === null || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.type === 'string';
}

export function isSDUIAction(value: unknown): value is SDUIAction {
  if (value === null || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.type === 'string' && typeof obj.payload === 'object' && obj.payload !== null;
}
