import type { SDUINode } from './types';
import type { ComponentRegistry } from './ComponentRegistry';

interface SDUIRendererProps {
  node: SDUINode;
  registry: ComponentRegistry;
}

export function SDUIRenderer({ node, registry }: SDUIRendererProps) {
  const Component = registry.get(node.type);
  if (!Component) return null;

  const children = node.children?.map((child, i) => (
    <SDUIRenderer key={i} node={child} registry={registry} />
  ));

  return (
    <Component {...node.props} actions={node.actions}>
      {children}
    </Component>
  );
}
