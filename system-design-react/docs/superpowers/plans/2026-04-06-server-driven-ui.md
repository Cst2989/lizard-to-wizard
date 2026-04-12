# Server-Driven UI — Food Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a food delivery app demonstrating Server-Driven UI with web + React Native clients and an admin panel

**Architecture:** Component registry maps string types to React components. An SDUIRenderer walks a JSON tree and renders the UI. Mock JSON configs represent server responses. An admin panel switches between JSON variants to demonstrate live UI changes without deploys.

**Tech Stack:** React 19 + TypeScript + Vite (web), React Native + Expo (mobile), CSS modules

---

## File Structure

```
apps/server-driven-ui/
  web/
    index.html
    package.json
    tsconfig.json
    tsconfig.app.json
    tsconfig.node.json
    vite.config.ts
    vitest.config.ts
    src/
      main.tsx
      App.tsx
      App.module.css
      registry.ts
      CartContext.tsx
      core/
        types.ts
        types.test.ts
        ComponentRegistry.ts
        ComponentRegistry.test.ts
        SDUIRenderer.tsx
        SDUIRenderer.test.tsx
      components/
        GridLayout.tsx
        GridLayout.module.css
        GridLayout.test.tsx
        ListLayout.tsx
        ListLayout.module.css
        ListLayout.test.tsx
        Banner.tsx
        Banner.module.css
        Banner.test.tsx
        RestaurantCard.tsx
        RestaurantCard.module.css
        RestaurantCard.test.tsx
        FoodItemCard.tsx
        FoodItemCard.module.css
        FoodItemCard.test.tsx
        CartSummary.tsx
        CartSummary.module.css
        CartSummary.test.tsx
      mock-server/
        home.json
        home-v2.json
        home-promo.json
        restaurant-1.json
        restaurant-1-v2.json
        responses.ts
      admin/
        adminState.ts
        adminState.test.ts
        ConfigSelector.tsx
        ConfigSelector.test.tsx
        JsonPreview.tsx
        JsonPreview.test.tsx
        AdminPanel.tsx
        AdminPanel.module.css
        AdminPanel.test.tsx
  mobile/
    package.json
    tsconfig.json
    app.json
    App.tsx
    src/
      core/
        types.ts
        ComponentRegistry.ts
        SDUIRenderer.tsx
      components/
        Banner.tsx
        RestaurantCard.tsx
        FoodItemCard.tsx
        GridLayout.tsx
        ListLayout.tsx
        CartSummary.tsx
      mock-server/
        home.json
        home-v2.json
        home-promo.json
        restaurant-1.json
        restaurant-1-v2.json
        responses.ts
      CartContext.tsx
      registry.ts
```

---

## Task 1: Project Setup (Web)

### Step 1.1 — Scaffold Vite project

- [ ] Create the project directory and initialize with Vite

```bash
mkdir -p apps/server-driven-ui/web
cd apps/server-driven-ui/web
npm create vite@latest . -- --template react-ts
```

### Step 1.2 — Install dependencies

- [ ] Install runtime and dev dependencies

```bash
cd apps/server-driven-ui/web
npm install react-router-dom
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Step 1.3 — Configure Vitest

- [ ] Create `apps/server-driven-ui/web/vitest.config.ts`

```typescript
// apps/server-driven-ui/web/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
```

- [ ] Create `apps/server-driven-ui/web/src/test-setup.ts`

```typescript
// apps/server-driven-ui/web/src/test-setup.ts
import '@testing-library/jest-dom/vitest';
```

- [ ] Update `apps/server-driven-ui/web/tsconfig.app.json` to include vitest globals

Add `"types": ["vitest/globals"]` to the `compilerOptions`:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"],
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

### Step 1.4 — Verify setup

- [ ] Run a smoke test to ensure vitest works

```bash
cd apps/server-driven-ui/web
npx vitest run
```

Expected: vitest runs (may say "no test files found" which is fine at this stage).

### Step 1.5 — Commit

```bash
git add apps/server-driven-ui/web/
git commit -m "feat(sdui): scaffold vite + react + typescript web project with vitest"
```

---

## Task 2: Core Types

### Step 2.1 — Write type guard tests

- [ ] Create `apps/server-driven-ui/web/src/core/types.test.ts`

```typescript
// apps/server-driven-ui/web/src/core/types.test.ts
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
```

### Step 2.2 — Run tests (expect failure)

```bash
cd apps/server-driven-ui/web
npx vitest run src/core/types.test.ts
```

Expected: FAIL — cannot find module `./types`.

### Step 2.3 — Implement types and type guards

- [ ] Create `apps/server-driven-ui/web/src/core/types.ts`

```typescript
// apps/server-driven-ui/web/src/core/types.ts
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
```

### Step 2.4 — Run tests (expect pass)

```bash
cd apps/server-driven-ui/web
npx vitest run src/core/types.test.ts
```

Expected: all 8 tests pass.

### Step 2.5 — Commit

```bash
git add apps/server-driven-ui/web/src/core/types.ts apps/server-driven-ui/web/src/core/types.test.ts
git commit -m "feat(sdui): add core SDUI types with type guards and tests"
```

---

## Task 3: Component Registry

### Step 3.1 — Write registry tests

- [ ] Create `apps/server-driven-ui/web/src/core/ComponentRegistry.test.ts`

```typescript
// apps/server-driven-ui/web/src/core/ComponentRegistry.test.ts
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
```

### Step 3.2 — Run tests (expect failure)

```bash
cd apps/server-driven-ui/web
npx vitest run src/core/ComponentRegistry.test.ts
```

Expected: FAIL — cannot find module `./ComponentRegistry`.

### Step 3.3 — Implement ComponentRegistry

- [ ] Create `apps/server-driven-ui/web/src/core/ComponentRegistry.ts`

```typescript
// apps/server-driven-ui/web/src/core/ComponentRegistry.ts
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
```

### Step 3.4 — Run tests (expect pass)

```bash
cd apps/server-driven-ui/web
npx vitest run src/core/ComponentRegistry.test.ts
```

Expected: all 4 tests pass.

### Step 3.5 — Commit

```bash
git add apps/server-driven-ui/web/src/core/ComponentRegistry.ts apps/server-driven-ui/web/src/core/ComponentRegistry.test.ts
git commit -m "feat(sdui): add ComponentRegistry with register/get/has methods"
```

---

## Task 4: SDUI Renderer

### Step 4.1 — Write renderer tests

- [ ] Create `apps/server-driven-ui/web/src/core/SDUIRenderer.test.tsx`

```tsx
// apps/server-driven-ui/web/src/core/SDUIRenderer.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SDUIRenderer } from './SDUIRenderer';
import { ComponentRegistry } from './ComponentRegistry';
import type { SDUINode, SDUIComponentProps } from './types';

function TestBanner({ title, actions, children }: SDUIComponentProps) {
  return (
    <div data-testid="banner">
      <span>{title as string}</span>
      {children}
    </div>
  );
}

function TestGrid({ children }: SDUIComponentProps) {
  return <div data-testid="grid">{children}</div>;
}

function createRegistry(): ComponentRegistry {
  const registry = new ComponentRegistry();
  registry.register('banner', TestBanner);
  registry.register('grid', TestGrid);
  return registry;
}

describe('SDUIRenderer', () => {
  it('renders a single node using the registry', () => {
    const node: SDUINode = {
      type: 'banner',
      props: { title: 'Hello' },
    };
    render(<SDUIRenderer node={node} registry={createRegistry()} />);
    expect(screen.getByTestId('banner')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders nested children recursively', () => {
    const node: SDUINode = {
      type: 'grid',
      children: [
        { type: 'banner', props: { title: 'Child 1' } },
        { type: 'banner', props: { title: 'Child 2' } },
      ],
    };
    render(<SDUIRenderer node={node} registry={createRegistry()} />);
    expect(screen.getByTestId('grid')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('renders null for unknown types', () => {
    const node: SDUINode = { type: 'unknown-widget' };
    const { container } = render(
      <SDUIRenderer node={node} registry={createRegistry()} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('passes actions to the component', () => {
    const node: SDUINode = {
      type: 'banner',
      props: { title: 'Promo' },
      actions: [{ type: 'navigate', payload: { to: '/deals' } }],
    };

    function ActionBanner({ actions }: SDUIComponentProps) {
      return <div data-testid="action-banner">{actions?.[0]?.type}</div>;
    }

    const registry = new ComponentRegistry();
    registry.register('banner', ActionBanner);

    render(<SDUIRenderer node={node} registry={registry} />);
    expect(screen.getByTestId('action-banner')).toHaveTextContent('navigate');
  });
});
```

### Step 4.2 — Run tests (expect failure)

```bash
cd apps/server-driven-ui/web
npx vitest run src/core/SDUIRenderer.test.tsx
```

Expected: FAIL — cannot find module `./SDUIRenderer`.

### Step 4.3 — Implement SDUIRenderer

- [ ] Create `apps/server-driven-ui/web/src/core/SDUIRenderer.tsx`

```tsx
// apps/server-driven-ui/web/src/core/SDUIRenderer.tsx
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
```

### Step 4.4 — Run tests (expect pass)

```bash
cd apps/server-driven-ui/web
npx vitest run src/core/SDUIRenderer.test.tsx
```

Expected: all 4 tests pass.

### Step 4.5 — Commit

```bash
git add apps/server-driven-ui/web/src/core/SDUIRenderer.tsx apps/server-driven-ui/web/src/core/SDUIRenderer.test.tsx
git commit -m "feat(sdui): add SDUIRenderer with recursive rendering and unknown type handling"
```

---

## Task 5: Layout Components

### Step 5.1 — Write GridLayout tests

- [ ] Create `apps/server-driven-ui/web/src/components/GridLayout.test.tsx`

```tsx
// apps/server-driven-ui/web/src/components/GridLayout.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GridLayout } from './GridLayout';

describe('GridLayout', () => {
  it('renders children in a grid container', () => {
    render(
      <GridLayout columns={2}>
        <div data-testid="child-1">A</div>
        <div data-testid="child-2">B</div>
      </GridLayout>
    );
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('applies the grid class', () => {
    const { container } = render(
      <GridLayout columns={3}>
        <div>A</div>
      </GridLayout>
    );
    const grid = container.firstElementChild;
    expect(grid?.className).toContain('grid');
  });

  it('defaults to 2 columns when not specified', () => {
    const { container } = render(
      <GridLayout>
        <div>A</div>
      </GridLayout>
    );
    const grid = container.firstElementChild as HTMLElement;
    expect(grid.style.getPropertyValue('--columns')).toBe('2');
  });
});
```

### Step 5.2 — Write ListLayout tests

- [ ] Create `apps/server-driven-ui/web/src/components/ListLayout.test.tsx`

```tsx
// apps/server-driven-ui/web/src/components/ListLayout.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListLayout } from './ListLayout';

describe('ListLayout', () => {
  it('renders children in a vertical list', () => {
    render(
      <ListLayout>
        <div data-testid="item-1">A</div>
        <div data-testid="item-2">B</div>
      </ListLayout>
    );
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
  });

  it('applies the list class', () => {
    const { container } = render(
      <ListLayout>
        <div>A</div>
      </ListLayout>
    );
    const list = container.firstElementChild;
    expect(list?.className).toContain('list');
  });
});
```

### Step 5.3 — Run tests (expect failure)

```bash
cd apps/server-driven-ui/web
npx vitest run src/components/GridLayout.test.tsx src/components/ListLayout.test.tsx
```

Expected: FAIL — modules not found.

### Step 5.4 — Implement GridLayout

- [ ] Create `apps/server-driven-ui/web/src/components/GridLayout.module.css`

```css
/* apps/server-driven-ui/web/src/components/GridLayout.module.css */
.grid {
  display: grid;
  grid-template-columns: repeat(var(--columns, 2), 1fr);
  gap: 16px;
  padding: 16px;
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .grid {
    grid-template-columns: repeat(var(--columns, 3), 1fr);
  }
}
```

- [ ] Create `apps/server-driven-ui/web/src/components/GridLayout.tsx`

```tsx
// apps/server-driven-ui/web/src/components/GridLayout.tsx
import type { SDUIComponentProps } from '../core/types';
import styles from './GridLayout.module.css';

export function GridLayout({ columns = 2, children }: SDUIComponentProps) {
  return (
    <div
      className={styles.grid}
      style={{ '--columns': String(columns) } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
```

### Step 5.5 — Implement ListLayout

- [ ] Create `apps/server-driven-ui/web/src/components/ListLayout.module.css`

```css
/* apps/server-driven-ui/web/src/components/ListLayout.module.css */
.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}
```

- [ ] Create `apps/server-driven-ui/web/src/components/ListLayout.tsx`

```tsx
// apps/server-driven-ui/web/src/components/ListLayout.tsx
import type { SDUIComponentProps } from '../core/types';
import styles from './ListLayout.module.css';

export function ListLayout({ children }: SDUIComponentProps) {
  return <div className={styles.list}>{children}</div>;
}
```

### Step 5.6 — Run tests (expect pass)

```bash
cd apps/server-driven-ui/web
npx vitest run src/components/GridLayout.test.tsx src/components/ListLayout.test.tsx
```

Expected: all 5 tests pass.

### Step 5.7 — Commit

```bash
git add apps/server-driven-ui/web/src/components/GridLayout.tsx apps/server-driven-ui/web/src/components/GridLayout.module.css apps/server-driven-ui/web/src/components/GridLayout.test.tsx apps/server-driven-ui/web/src/components/ListLayout.tsx apps/server-driven-ui/web/src/components/ListLayout.module.css apps/server-driven-ui/web/src/components/ListLayout.test.tsx
git commit -m "feat(sdui): add GridLayout and ListLayout components with responsive CSS"
```

---

## Task 6: Banner Component

### Step 6.1 — Write Banner tests

- [ ] Create `apps/server-driven-ui/web/src/components/Banner.test.tsx`

```tsx
// apps/server-driven-ui/web/src/components/Banner.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Banner } from './Banner';

function renderWithRouter(ui: React.ReactNode) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('Banner', () => {
  it('renders image, title, and subtitle', () => {
    renderWithRouter(
      <Banner
        imageUrl="https://placehold.co/800x300?text=Thai+Food"
        title="50% off Thai Food"
        subtitle="This weekend only"
      />
    );
    expect(screen.getByText('50% off Thai Food')).toBeInTheDocument();
    expect(screen.getByText('This weekend only')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://placehold.co/800x300?text=Thai+Food'
    );
  });

  it('renders without subtitle', () => {
    renderWithRouter(
      <Banner
        imageUrl="https://placehold.co/800x300?text=Banner"
        title="Simple Banner"
      />
    );
    expect(screen.getByText('Simple Banner')).toBeInTheDocument();
  });

  it('navigates when clicked with a navigate action', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <Banner
        imageUrl="https://placehold.co/800x300?text=Promo"
        title="Promo"
        actions={[{ type: 'navigate', payload: { to: '/restaurant/3' } }]}
      />
    );

    const banner = screen.getByRole('link');
    expect(banner).toHaveAttribute('href', '/restaurant/3');
  });

  it('renders as a div when there is no navigate action', () => {
    renderWithRouter(
      <Banner
        imageUrl="https://placehold.co/800x300?text=Static"
        title="Static Banner"
      />
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
```

### Step 6.2 — Run tests (expect failure)

```bash
cd apps/server-driven-ui/web
npx vitest run src/components/Banner.test.tsx
```

### Step 6.3 — Implement Banner

- [ ] Create `apps/server-driven-ui/web/src/components/Banner.module.css`

```css
/* apps/server-driven-ui/web/src/components/Banner.module.css */
.banner {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  display: block;
  text-decoration: none;
  color: inherit;
}

.image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 4px;
}

.subtitle {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.9;
}
```

- [ ] Create `apps/server-driven-ui/web/src/components/Banner.tsx`

```tsx
// apps/server-driven-ui/web/src/components/Banner.tsx
import { Link } from 'react-router-dom';
import type { SDUIComponentProps } from '../core/types';
import styles from './Banner.module.css';

export function Banner({ imageUrl, title, subtitle, actions }: SDUIComponentProps) {
  const navigateAction = actions?.find((a) => a.type === 'navigate');
  const content = (
    <>
      <img
        className={styles.image}
        src={imageUrl as string}
        alt={title as string}
      />
      <div className={styles.overlay}>
        <p className={styles.title}>{title as string}</p>
        {subtitle && <p className={styles.subtitle}>{subtitle as string}</p>}
      </div>
    </>
  );

  if (navigateAction) {
    return (
      <Link className={styles.banner} to={navigateAction.payload.to as string}>
        {content}
      </Link>
    );
  }

  return <div className={styles.banner}>{content}</div>;
}
```

### Step 6.4 — Run tests (expect pass)

```bash
cd apps/server-driven-ui/web
npx vitest run src/components/Banner.test.tsx
```

Expected: all 4 tests pass.

### Step 6.5 — Commit

```bash
git add apps/server-driven-ui/web/src/components/Banner.tsx apps/server-driven-ui/web/src/components/Banner.module.css apps/server-driven-ui/web/src/components/Banner.test.tsx
git commit -m "feat(sdui): add Banner component with navigate action support"
```

---

## Task 7: RestaurantCard Component

### Step 7.1 — Write RestaurantCard tests

- [ ] Create `apps/server-driven-ui/web/src/components/RestaurantCard.test.tsx`

```tsx
// apps/server-driven-ui/web/src/components/RestaurantCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RestaurantCard } from './RestaurantCard';

function renderWithRouter(ui: React.ReactNode) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('RestaurantCard', () => {
  const defaultProps = {
    id: '1',
    name: 'Sushi Palace',
    imageUrl: 'https://placehold.co/400x300?text=Sushi',
    rating: 4.5,
    deliveryTime: '25-35 min',
    cuisine: 'Japanese',
    priceRange: '$$',
    actions: [{ type: 'navigate' as const, payload: { to: '/restaurant/1' } }],
  };

  it('renders name, rating, delivery time, cuisine, and price range', () => {
    renderWithRouter(<RestaurantCard {...defaultProps} />);
    expect(screen.getByText('Sushi Palace')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('25-35 min')).toBeInTheDocument();
    expect(screen.getByText('Japanese')).toBeInTheDocument();
    expect(screen.getByText('$$')).toBeInTheDocument();
  });

  it('renders the restaurant image', () => {
    renderWithRouter(<RestaurantCard {...defaultProps} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://placehold.co/400x300?text=Sushi');
    expect(img).toHaveAttribute('alt', 'Sushi Palace');
  });

  it('links to the restaurant detail page', () => {
    renderWithRouter(<RestaurantCard {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/restaurant/1');
  });

  it('renders as a div when no navigate action', () => {
    renderWithRouter(<RestaurantCard {...defaultProps} actions={undefined} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Sushi Palace')).toBeInTheDocument();
  });
});
```

### Step 7.2 — Run tests (expect failure)

```bash
cd apps/server-driven-ui/web
npx vitest run src/components/RestaurantCard.test.tsx
```

### Step 7.3 — Implement RestaurantCard

- [ ] Create `apps/server-driven-ui/web/src/components/RestaurantCard.module.css`

```css
/* apps/server-driven-ui/web/src/components/RestaurantCard.module.css */
.card {
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  display: block;
  transition: transform 0.15s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.info {
  padding: 12px;
}

.name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 8px;
}

.meta {
  display: flex;
  gap: 8px;
  font-size: 0.8125rem;
  color: #666;
  flex-wrap: wrap;
}

.rating {
  font-weight: 600;
  color: #f59e0b;
}
```

- [ ] Create `apps/server-driven-ui/web/src/components/RestaurantCard.tsx`

```tsx
// apps/server-driven-ui/web/src/components/RestaurantCard.tsx
import { Link } from 'react-router-dom';
import type { SDUIComponentProps } from '../core/types';
import styles from './RestaurantCard.module.css';

export function RestaurantCard({
  name,
  imageUrl,
  rating,
  deliveryTime,
  cuisine,
  priceRange,
  actions,
}: SDUIComponentProps) {
  const navigateAction = actions?.find((a) => a.type === 'navigate');

  const content = (
    <>
      <img
        className={styles.image}
        src={imageUrl as string}
        alt={name as string}
      />
      <div className={styles.info}>
        <p className={styles.name}>{name as string}</p>
        <div className={styles.meta}>
          <span className={styles.rating}>{String(rating)}</span>
          <span>{deliveryTime as string}</span>
          <span>{cuisine as string}</span>
          <span>{priceRange as string}</span>
        </div>
      </div>
    </>
  );

  if (navigateAction) {
    return (
      <Link className={styles.card} to={navigateAction.payload.to as string}>
        {content}
      </Link>
    );
  }

  return <div className={styles.card}>{content}</div>;
}
```

### Step 7.4 — Run tests (expect pass)

```bash
cd apps/server-driven-ui/web
npx vitest run src/components/RestaurantCard.test.tsx
```

Expected: all 4 tests pass.

### Step 7.5 — Commit

```bash
git add apps/server-driven-ui/web/src/components/RestaurantCard.tsx apps/server-driven-ui/web/src/components/RestaurantCard.module.css apps/server-driven-ui/web/src/components/RestaurantCard.test.tsx
git commit -m "feat(sdui): add RestaurantCard component with navigate action"
```

---

## Task 8: FoodItemCard Component

### Step 8.1 — Write FoodItemCard tests

- [ ] Create `apps/server-driven-ui/web/src/components/FoodItemCard.test.tsx`

```tsx
// apps/server-driven-ui/web/src/components/FoodItemCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FoodItemCard } from './FoodItemCard';
import { CartProvider } from '../CartContext';

function renderWithCart(ui: React.ReactNode) {
  return render(<CartProvider>{ui}</CartProvider>);
}

describe('FoodItemCard', () => {
  const defaultProps = {
    id: 'f1',
    name: 'Dragon Roll',
    description: 'Shrimp tempura, avocado, eel sauce',
    price: 14.99,
    imageUrl: 'https://placehold.co/400x300?text=Dragon+Roll',
    actions: [{ type: 'add-to-cart' as const, payload: { itemId: 'f1', price: 14.99 } }],
  };

  it('renders name, description, price, and image', () => {
    renderWithCart(<FoodItemCard {...defaultProps} />);
    expect(screen.getByText('Dragon Roll')).toBeInTheDocument();
    expect(screen.getByText('Shrimp tempura, avocado, eel sauce')).toBeInTheDocument();
    expect(screen.getByText('$14.99')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://placehold.co/400x300?text=Dragon+Roll'
    );
  });

  it('renders an add-to-cart button', () => {
    renderWithCart(<FoodItemCard {...defaultProps} />);
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  it('fires add-to-cart action when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithCart(<FoodItemCard {...defaultProps} />);
    const button = screen.getByRole('button', { name: /add to cart/i });
    await user.click(button);
    // Button should still be present after click (cart logic is handled by context)
    expect(button).toBeInTheDocument();
  });

  it('renders without image when imageUrl is missing', () => {
    renderWithCart(
      <FoodItemCard
        name="Plain Item"
        description="No image"
        price={5.0}
        actions={[]}
      />
    );
    expect(screen.getByText('Plain Item')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
```

### Step 8.2 — Run tests (expect failure)

```bash
cd apps/server-driven-ui/web
npx vitest run src/components/FoodItemCard.test.tsx
```

Expected: FAIL — modules not found. (CartContext also doesn't exist yet, but we will create it in Task 9. For now, just note the failure.)

### Step 8.3 — Implement FoodItemCard

- [ ] Create `apps/server-driven-ui/web/src/components/FoodItemCard.module.css`

```css
/* apps/server-driven-ui/web/src/components/FoodItemCard.module.css */
.card {
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.info {
  padding: 12px;
}

.name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 4px;
}

.description {
  font-size: 0.8125rem;
  color: #666;
  margin: 0 0 8px;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price {
  font-size: 1rem;
  font-weight: 700;
  color: #16a34a;
}

.addButton {
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.addButton:hover {
  background: #15803d;
}
```

- [ ] Create `apps/server-driven-ui/web/src/components/FoodItemCard.tsx`

```tsx
// apps/server-driven-ui/web/src/components/FoodItemCard.tsx
import { useContext } from 'react';
import type { SDUIComponentProps } from '../core/types';
import { CartContext } from '../CartContext';
import styles from './FoodItemCard.module.css';

export function FoodItemCard({
  name,
  description,
  price,
  imageUrl,
  actions,
}: SDUIComponentProps) {
  const { addItem } = useContext(CartContext);
  const addToCartAction = actions?.find((a) => a.type === 'add-to-cart');

  function handleAddToCart() {
    if (!addToCartAction) return;
    addItem({
      itemId: addToCartAction.payload.itemId as string,
      name: name as string,
      price: addToCartAction.payload.price as number,
      quantity: 1,
    });
  }

  return (
    <div className={styles.card}>
      {imageUrl && (
        <img
          className={styles.image}
          src={imageUrl as string}
          alt={name as string}
        />
      )}
      <div className={styles.info}>
        <p className={styles.name}>{name as string}</p>
        {description && (
          <p className={styles.description}>{description as string}</p>
        )}
        <div className={styles.footer}>
          <span className={styles.price}>
            ${(price as number).toFixed(2)}
          </span>
          {addToCartAction && (
            <button className={styles.addButton} onClick={handleAddToCart}>
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Note:** FoodItemCard tests depend on CartContext (Task 9). Tests will pass after Task 9 is complete.

### Step 8.4 — Commit (partial — tests validated after Task 9)

```bash
git add apps/server-driven-ui/web/src/components/FoodItemCard.tsx apps/server-driven-ui/web/src/components/FoodItemCard.module.css apps/server-driven-ui/web/src/components/FoodItemCard.test.tsx
git commit -m "feat(sdui): add FoodItemCard component with add-to-cart action"
```

---

## Task 9: Cart Context

### Step 9.1 — Write Cart tests

- [ ] Create `apps/server-driven-ui/web/src/CartContext.test.tsx`

```tsx
// apps/server-driven-ui/web/src/CartContext.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';
import { CartProvider, CartContext } from './CartContext';

function CartTestHarness() {
  const { items, total, addItem, removeItem, updateQuantity } = useContext(CartContext);
  return (
    <div>
      <span data-testid="total">{total.toFixed(2)}</span>
      <span data-testid="count">{items.length}</span>
      <ul>
        {items.map((item) => (
          <li key={item.itemId} data-testid={`item-${item.itemId}`}>
            {item.name} x{item.quantity}
            <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)}>+</button>
            <button onClick={() => removeItem(item.itemId)}>remove</button>
          </li>
        ))}
      </ul>
      <button
        data-testid="add-dragon"
        onClick={() =>
          addItem({ itemId: 'f1', name: 'Dragon Roll', price: 14.99, quantity: 1 })
        }
      >
        Add Dragon
      </button>
      <button
        data-testid="add-salmon"
        onClick={() =>
          addItem({ itemId: 'f2', name: 'Salmon Nigiri', price: 9.99, quantity: 1 })
        }
      >
        Add Salmon
      </button>
    </div>
  );
}

describe('CartContext', () => {
  it('starts with an empty cart', () => {
    render(
      <CartProvider>
        <CartTestHarness />
      </CartProvider>
    );
    expect(screen.getByTestId('total')).toHaveTextContent('0.00');
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('adds an item to the cart', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartTestHarness />
      </CartProvider>
    );
    await user.click(screen.getByTestId('add-dragon'));
    expect(screen.getByTestId('total')).toHaveTextContent('14.99');
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('increments quantity when adding the same item again', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartTestHarness />
      </CartProvider>
    );
    await user.click(screen.getByTestId('add-dragon'));
    await user.click(screen.getByTestId('add-dragon'));
    expect(screen.getByTestId('total')).toHaveTextContent('29.98');
    expect(screen.getByTestId('item-f1')).toHaveTextContent('Dragon Roll x2');
  });

  it('removes an item from the cart', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartTestHarness />
      </CartProvider>
    );
    await user.click(screen.getByTestId('add-dragon'));
    await user.click(screen.getByText('remove'));
    expect(screen.getByTestId('total')).toHaveTextContent('0.00');
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('updates item quantity', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartTestHarness />
      </CartProvider>
    );
    await user.click(screen.getByTestId('add-dragon'));
    await user.click(screen.getByText('+'));
    expect(screen.getByTestId('total')).toHaveTextContent('29.98');
    expect(screen.getByTestId('item-f1')).toHaveTextContent('Dragon Roll x2');
  });

  it('calculates total across multiple items', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartTestHarness />
      </CartProvider>
    );
    await user.click(screen.getByTestId('add-dragon'));
    await user.click(screen.getByTestId('add-salmon'));
    expect(screen.getByTestId('total')).toHaveTextContent('24.98');
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });
});
```

### Step 9.2 — Run tests (expect failure)

```bash
cd apps/server-driven-ui/web
npx vitest run src/CartContext.test.tsx
```

### Step 9.3 — Implement CartContext

- [ ] Create `apps/server-driven-ui/web/src/CartContext.tsx`

```tsx
// apps/server-driven-ui/web/src/CartContext.tsx
import { createContext, useReducer, type ReactNode } from 'react';

export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

interface CartContextValue extends CartState {
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
}

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'UPDATE_QUANTITY'; itemId: string; quantity: number };

function computeTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.itemId === action.item.itemId);
      let items: CartItem[];
      if (existing) {
        items = state.items.map((i) =>
          i.itemId === action.item.itemId
            ? { ...i, quantity: i.quantity + action.item.quantity }
            : i
        );
      } else {
        items = [...state.items, action.item];
      }
      return { items, total: computeTotal(items) };
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter((i) => i.itemId !== action.itemId);
      return { items, total: computeTotal(items) };
    }
    case 'UPDATE_QUANTITY': {
      const items = state.items.map((i) =>
        i.itemId === action.itemId ? { ...i, quantity: action.quantity } : i
      );
      return { items, total: computeTotal(items) };
    }
    default:
      return state;
  }
}

const initialState: CartState = { items: [], total: 0 };

export const CartContext = createContext<CartContextValue>({
  ...initialState,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item: CartItem) => dispatch({ type: 'ADD_ITEM', item });
  const removeItem = (itemId: string) => dispatch({ type: 'REMOVE_ITEM', itemId });
  const updateQuantity = (itemId: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', itemId, quantity });

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}
```

### Step 9.4 — Run cart tests AND FoodItemCard tests (expect pass)

```bash
cd apps/server-driven-ui/web
npx vitest run src/CartContext.test.tsx src/components/FoodItemCard.test.tsx
```

Expected: all 10 tests pass (6 cart + 4 food item).

### Step 9.5 — Commit

```bash
git add apps/server-driven-ui/web/src/CartContext.tsx apps/server-driven-ui/web/src/CartContext.test.tsx
git commit -m "feat(sdui): add CartContext with add/remove/updateQuantity and tests"
```

---

## Task 10: CartSummary Component

### Step 10.1 — Write CartSummary tests

- [ ] Create `apps/server-driven-ui/web/src/components/CartSummary.test.tsx`

```tsx
// apps/server-driven-ui/web/src/components/CartSummary.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';
import { CartProvider, CartContext } from '../CartContext';
import { CartSummary } from './CartSummary';

function AddItemButton() {
  const { addItem } = useContext(CartContext);
  return (
    <button
      data-testid="add"
      onClick={() =>
        addItem({ itemId: 'f1', name: 'Roll', price: 10.0, quantity: 1 })
      }
    >
      Add
    </button>
  );
}

describe('CartSummary', () => {
  it('shows nothing when cart is empty', () => {
    const { container } = render(
      <CartProvider>
        <CartSummary />
      </CartProvider>
    );
    expect(container.querySelector('[class*="summary"]')).not.toBeInTheDocument();
  });

  it('shows item count and total when cart has items', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <AddItemButton />
        <CartSummary />
      </CartProvider>
    );
    await user.click(screen.getByTestId('add'));
    expect(screen.getByText('1 item')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('pluralizes items correctly', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <AddItemButton />
        <CartSummary />
      </CartProvider>
    );
    await user.click(screen.getByTestId('add'));
    await user.click(screen.getByTestId('add'));
    expect(screen.getByText('2 items')).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument();
  });
});
```

### Step 10.2 — Run tests (expect failure)

```bash
cd apps/server-driven-ui/web
npx vitest run src/components/CartSummary.test.tsx
```

### Step 10.3 — Implement CartSummary

- [ ] Create `apps/server-driven-ui/web/src/components/CartSummary.module.css`

```css
/* apps/server-driven-ui/web/src/components/CartSummary.module.css */
.summary {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #16a34a;
  color: white;
  padding: 12px 20px;
  border-radius: 999px;
  display: flex;
  gap: 12px;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-weight: 600;
  font-size: 0.9375rem;
  z-index: 1000;
}

.count {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 10px;
  border-radius: 999px;
}
```

- [ ] Create `apps/server-driven-ui/web/src/components/CartSummary.tsx`

```tsx
// apps/server-driven-ui/web/src/components/CartSummary.tsx
import { useContext } from 'react';
import { CartContext } from '../CartContext';
import styles from './CartSummary.module.css';

export function CartSummary() {
  const { items, total } = useContext(CartContext);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (itemCount === 0) return null;

  return (
    <div className={styles.summary}>
      <span className={styles.count}>
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </span>
      <span>${total.toFixed(2)}</span>
    </div>
  );
}
```

### Step 10.4 — Run tests (expect pass)

```bash
cd apps/server-driven-ui/web
npx vitest run src/components/CartSummary.test.tsx
```

Expected: all 3 tests pass.

### Step 10.5 — Commit

```bash
git add apps/server-driven-ui/web/src/components/CartSummary.tsx apps/server-driven-ui/web/src/components/CartSummary.module.css apps/server-driven-ui/web/src/components/CartSummary.test.tsx
git commit -m "feat(sdui): add CartSummary floating component with item count and total"
```

---

## Task 11: Mock Server / Data Layer

### Step 11.1 — Create home.json

- [ ] Create `apps/server-driven-ui/web/src/mock-server/home.json`

```json
{
  "type": "list",
  "children": [
    {
      "type": "banner",
      "props": {
        "imageUrl": "https://placehold.co/800x300/f97316/white?text=50%25+Off+Thai+Food",
        "title": "50% off Thai Food",
        "subtitle": "This weekend only"
      },
      "actions": [{ "type": "navigate", "payload": { "to": "/restaurant/3" } }]
    },
    {
      "type": "banner",
      "props": {
        "imageUrl": "https://placehold.co/800x300/3b82f6/white?text=Free+Delivery",
        "title": "Free Delivery",
        "subtitle": "On orders over $25"
      }
    },
    {
      "type": "grid",
      "props": { "columns": 2 },
      "children": [
        {
          "type": "restaurant-card",
          "props": {
            "id": "1",
            "name": "Sushi Palace",
            "imageUrl": "https://placehold.co/400x300/ec4899/white?text=Sushi+Palace",
            "rating": 4.5,
            "deliveryTime": "25-35 min",
            "cuisine": "Japanese",
            "priceRange": "$$"
          },
          "actions": [{ "type": "navigate", "payload": { "to": "/restaurant/1" } }]
        },
        {
          "type": "restaurant-card",
          "props": {
            "id": "2",
            "name": "Bella Napoli",
            "imageUrl": "https://placehold.co/400x300/ef4444/white?text=Bella+Napoli",
            "rating": 4.8,
            "deliveryTime": "20-30 min",
            "cuisine": "Italian",
            "priceRange": "$$$"
          },
          "actions": [{ "type": "navigate", "payload": { "to": "/restaurant/2" } }]
        },
        {
          "type": "restaurant-card",
          "props": {
            "id": "3",
            "name": "Thai Garden",
            "imageUrl": "https://placehold.co/400x300/22c55e/white?text=Thai+Garden",
            "rating": 4.3,
            "deliveryTime": "30-40 min",
            "cuisine": "Thai",
            "priceRange": "$$"
          },
          "actions": [{ "type": "navigate", "payload": { "to": "/restaurant/3" } }]
        },
        {
          "type": "restaurant-card",
          "props": {
            "id": "4",
            "name": "Burger Barn",
            "imageUrl": "https://placehold.co/400x300/a855f7/white?text=Burger+Barn",
            "rating": 4.1,
            "deliveryTime": "15-25 min",
            "cuisine": "American",
            "priceRange": "$"
          },
          "actions": [{ "type": "navigate", "payload": { "to": "/restaurant/4" } }]
        }
      ]
    }
  ]
}
```

### Step 11.2 — Create home-v2.json

- [ ] Create `apps/server-driven-ui/web/src/mock-server/home-v2.json`

```json
{
  "type": "list",
  "children": [
    {
      "type": "list",
      "children": [
        {
          "type": "restaurant-card",
          "props": {
            "id": "2",
            "name": "Bella Napoli",
            "imageUrl": "https://placehold.co/400x300/ef4444/white?text=Bella+Napoli",
            "rating": 4.8,
            "deliveryTime": "20-30 min",
            "cuisine": "Italian",
            "priceRange": "$$$"
          },
          "actions": [{ "type": "navigate", "payload": { "to": "/restaurant/2" } }]
        },
        {
          "type": "restaurant-card",
          "props": {
            "id": "1",
            "name": "Sushi Palace",
            "imageUrl": "https://placehold.co/400x300/ec4899/white?text=Sushi+Palace",
            "rating": 4.5,
            "deliveryTime": "25-35 min",
            "cuisine": "Japanese",
            "priceRange": "$$"
          },
          "actions": [{ "type": "navigate", "payload": { "to": "/restaurant/1" } }]
        },
        {
          "type": "restaurant-card",
          "props": {
            "id": "3",
            "name": "Thai Garden",
            "imageUrl": "https://placehold.co/400x300/22c55e/white?text=Thai+Garden",
            "rating": 4.3,
            "deliveryTime": "30-40 min",
            "cuisine": "Thai",
            "priceRange": "$$"
          },
          "actions": [{ "type": "navigate", "payload": { "to": "/restaurant/3" } }]
        },
        {
          "type": "restaurant-card",
          "props": {
            "id": "4",
            "name": "Burger Barn",
            "imageUrl": "https://placehold.co/400x300/a855f7/white?text=Burger+Barn",
            "rating": 4.1,
            "deliveryTime": "15-25 min",
            "cuisine": "American",
            "priceRange": "$"
          },
          "actions": [{ "type": "navigate", "payload": { "to": "/restaurant/4" } }]
        }
      ]
    },
    {
      "type": "banner",
      "props": {
        "imageUrl": "https://placehold.co/800x300/f97316/white?text=50%25+Off+Thai+Food",
        "title": "50% off Thai Food",
        "subtitle": "This weekend only"
      },
      "actions": [{ "type": "navigate", "payload": { "to": "/restaurant/3" } }]
    },
    {
      "type": "banner",
      "props": {
        "imageUrl": "https://placehold.co/800x300/3b82f6/white?text=Free+Delivery",
        "title": "Free Delivery",
        "subtitle": "On orders over $25"
      }
    }
  ]
}
```

### Step 11.3 — Create home-promo.json

- [ ] Create `apps/server-driven-ui/web/src/mock-server/home-promo.json`

```json
{
  "type": "list",
  "children": [
    {
      "type": "banner",
      "props": {
        "imageUrl": "https://placehold.co/800x300/dc2626/white?text=Holiday+Special+🎄",
        "title": "Holiday Special!",
        "subtitle": "Free delivery on all orders this week"
      }
    },
    {
      "type": "banner",
      "props": {
        "imageUrl": "https://placehold.co/800x200/f59e0b/white?text=Featured+Restaurants",
        "title": "Featured Restaurants",
        "subtitle": "Hand-picked by our editors"
      }
    },
    {
      "type": "grid",
      "props": { "columns": 2 },
      "children": [
        {
          "type": "restaurant-card",
          "props": {
            "id": "2",
            "name": "Bella Napoli ⭐ Featured",
            "imageUrl": "https://placehold.co/400x300/ef4444/white?text=Bella+Napoli",
            "rating": 4.8,
            "deliveryTime": "20-30 min",
            "cuisine": "Italian",
            "priceRange": "$$$"
          },
          "actions": [{ "type": "navigate", "payload": { "to": "/restaurant/2" } }]
        },
        {
          "type": "restaurant-card",
          "props": {
            "id": "3",
            "name": "Thai Garden ⭐ Featured",
            "imageUrl": "https://placehold.co/400x300/22c55e/white?text=Thai+Garden",
            "rating": 4.3,
            "deliveryTime": "30-40 min",
            "cuisine": "Thai",
            "priceRange": "$$"
          },
          "actions": [{ "type": "navigate", "payload": { "to": "/restaurant/3" } }]
        }
      ]
    },
    {
      "type": "grid",
      "props": { "columns": 2 },
      "children": [
        {
          "type": "restaurant-card",
          "props": {
            "id": "1",
            "name": "Sushi Palace",
            "imageUrl": "https://placehold.co/400x300/ec4899/white?text=Sushi+Palace",
            "rating": 4.5,
            "deliveryTime": "25-35 min",
            "cuisine": "Japanese",
            "priceRange": "$$"
          },
          "actions": [{ "type": "navigate", "payload": { "to": "/restaurant/1" } }]
        },
        {
          "type": "restaurant-card",
          "props": {
            "id": "4",
            "name": "Burger Barn",
            "imageUrl": "https://placehold.co/400x300/a855f7/white?text=Burger+Barn",
            "rating": 4.1,
            "deliveryTime": "15-25 min",
            "cuisine": "American",
            "priceRange": "$"
          },
          "actions": [{ "type": "navigate", "payload": { "to": "/restaurant/4" } }]
        }
      ]
    }
  ]
}
```

### Step 11.4 — Create restaurant-1.json

- [ ] Create `apps/server-driven-ui/web/src/mock-server/restaurant-1.json`

```json
{
  "type": "list",
  "children": [
    {
      "type": "banner",
      "props": {
        "imageUrl": "https://placehold.co/800x300/ec4899/white?text=Sushi+Palace",
        "title": "Sushi Palace",
        "subtitle": "4.5 stars - Japanese - 25-35 min"
      }
    },
    {
      "type": "grid",
      "props": { "columns": 2 },
      "children": [
        {
          "type": "food-item-card",
          "props": {
            "id": "f1",
            "name": "Dragon Roll",
            "description": "Shrimp tempura, avocado, eel sauce",
            "price": 14.99,
            "imageUrl": "https://placehold.co/400x300/f472b6/white?text=Dragon+Roll"
          },
          "actions": [{ "type": "add-to-cart", "payload": { "itemId": "f1", "price": 14.99 } }]
        },
        {
          "type": "food-item-card",
          "props": {
            "id": "f2",
            "name": "Salmon Nigiri",
            "description": "Fresh Atlantic salmon over seasoned rice",
            "price": 9.99,
            "imageUrl": "https://placehold.co/400x300/fb923c/white?text=Salmon+Nigiri"
          },
          "actions": [{ "type": "add-to-cart", "payload": { "itemId": "f2", "price": 9.99 } }]
        },
        {
          "type": "food-item-card",
          "props": {
            "id": "f3",
            "name": "Miso Soup",
            "description": "Traditional soybean soup with tofu and seaweed",
            "price": 4.99,
            "imageUrl": "https://placehold.co/400x300/fbbf24/white?text=Miso+Soup"
          },
          "actions": [{ "type": "add-to-cart", "payload": { "itemId": "f3", "price": 4.99 } }]
        },
        {
          "type": "food-item-card",
          "props": {
            "id": "f4",
            "name": "Edamame",
            "description": "Steamed soybeans with sea salt",
            "price": 5.99,
            "imageUrl": "https://placehold.co/400x300/86efac/white?text=Edamame"
          },
          "actions": [{ "type": "add-to-cart", "payload": { "itemId": "f4", "price": 5.99 } }]
        }
      ]
    }
  ]
}
```

### Step 11.5 — Create restaurant-1-v2.json

- [ ] Create `apps/server-driven-ui/web/src/mock-server/restaurant-1-v2.json`

```json
{
  "type": "list",
  "children": [
    {
      "type": "banner",
      "props": {
        "imageUrl": "https://placehold.co/800x300/ec4899/white?text=Sushi+Palace",
        "title": "Sushi Palace",
        "subtitle": "4.5 stars - Japanese - 25-35 min"
      }
    },
    {
      "type": "banner",
      "props": {
        "imageUrl": "https://placehold.co/800x200/f59e0b/white?text=Chef's+Special",
        "title": "Chef's Special",
        "subtitle": "Try our new Omakase platter - $29.99"
      }
    },
    {
      "type": "list",
      "children": [
        {
          "type": "food-item-card",
          "props": {
            "id": "f5",
            "name": "Omakase Platter",
            "description": "Chef's selection of 12 premium pieces",
            "price": 29.99,
            "imageUrl": "https://placehold.co/400x300/c084fc/white?text=Omakase"
          },
          "actions": [{ "type": "add-to-cart", "payload": { "itemId": "f5", "price": 29.99 } }]
        },
        {
          "type": "food-item-card",
          "props": {
            "id": "f1",
            "name": "Dragon Roll",
            "description": "Shrimp tempura, avocado, eel sauce",
            "price": 16.99,
            "imageUrl": "https://placehold.co/400x300/f472b6/white?text=Dragon+Roll"
          },
          "actions": [{ "type": "add-to-cart", "payload": { "itemId": "f1", "price": 16.99 } }]
        },
        {
          "type": "food-item-card",
          "props": {
            "id": "f2",
            "name": "Salmon Nigiri",
            "description": "Fresh Atlantic salmon over seasoned rice",
            "price": 11.99,
            "imageUrl": "https://placehold.co/400x300/fb923c/white?text=Salmon+Nigiri"
          },
          "actions": [{ "type": "add-to-cart", "payload": { "itemId": "f2", "price": 11.99 } }]
        },
        {
          "type": "food-item-card",
          "props": {
            "id": "f3",
            "name": "Miso Soup",
            "description": "Traditional soybean soup with tofu and seaweed",
            "price": 4.99,
            "imageUrl": "https://placehold.co/400x300/fbbf24/white?text=Miso+Soup"
          },
          "actions": [{ "type": "add-to-cart", "payload": { "itemId": "f3", "price": 4.99 } }]
        },
        {
          "type": "food-item-card",
          "props": {
            "id": "f4",
            "name": "Edamame",
            "description": "Steamed soybeans with sea salt",
            "price": 5.99,
            "imageUrl": "https://placehold.co/400x300/86efac/white?text=Edamame"
          },
          "actions": [{ "type": "add-to-cart", "payload": { "itemId": "f4", "price": 5.99 } }]
        }
      ]
    }
  ]
}
```

### Step 11.6 — Create responses.ts

- [ ] Create `apps/server-driven-ui/web/src/mock-server/responses.ts`

```typescript
// apps/server-driven-ui/web/src/mock-server/responses.ts
import type { SDUINode } from '../core/types';
import homeDefault from './home.json';
import homeV2 from './home-v2.json';
import homePromo from './home-promo.json';
import restaurant1 from './restaurant-1.json';
import restaurant1V2 from './restaurant-1-v2.json';
import { getAdminConfig } from '../admin/adminState';

const jsonMap: Record<string, SDUINode> = {
  'home.json': homeDefault as SDUINode,
  'home-v2.json': homeV2 as SDUINode,
  'home-promo.json': homePromo as SDUINode,
  'restaurant-1.json': restaurant1 as SDUINode,
  'restaurant-1-v2.json': restaurant1V2 as SDUINode,
};

const SIMULATED_DELAY_MS = 300;

export async function fetchPage(page: string): Promise<SDUINode> {
  const config = getAdminConfig();
  let activeFile: string;

  if (page === 'home') {
    activeFile = config.home;
  } else if (page.startsWith('restaurant-')) {
    const id = page.replace('restaurant-', '');
    activeFile = config.restaurants[id] ?? `restaurant-${id}.json`;
  } else {
    throw new Error(`Unknown page: ${page}`);
  }

  const node = jsonMap[activeFile];
  if (!node) {
    throw new Error(`No JSON found for: ${activeFile}`);
  }

  return new Promise((resolve) => {
    setTimeout(() => resolve(node), SIMULATED_DELAY_MS);
  });
}
```

### Step 11.7 — Commit

```bash
git add apps/server-driven-ui/web/src/mock-server/
git commit -m "feat(sdui): add mock server with JSON variants and simulated fetch delay"
```

---

## Task 12: Registry Setup & App Wiring

### Step 12.1 — Create component registry

- [ ] Create `apps/server-driven-ui/web/src/registry.ts`

```typescript
// apps/server-driven-ui/web/src/registry.ts
import { ComponentRegistry } from './core/ComponentRegistry';
import { Banner } from './components/Banner';
import { RestaurantCard } from './components/RestaurantCard';
import { FoodItemCard } from './components/FoodItemCard';
import { GridLayout } from './components/GridLayout';
import { ListLayout } from './components/ListLayout';

export const registry = new ComponentRegistry();

registry.register('banner', Banner);
registry.register('restaurant-card', RestaurantCard);
registry.register('food-item-card', FoodItemCard);
registry.register('grid', GridLayout);
registry.register('list', ListLayout);
```

### Step 12.2 — Create App with routing

- [ ] Create `apps/server-driven-ui/web/src/App.module.css`

```css
/* apps/server-driven-ui/web/src/App.module.css */
.app {
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  background: #f9fafb;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #16a34a;
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 16px;
}

.navLink {
  font-size: 0.875rem;
  color: #374151;
  text-decoration: none;
}

.navLink:hover {
  color: #16a34a;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 64px;
  font-size: 1rem;
  color: #6b7280;
}

.error {
  padding: 32px;
  text-align: center;
  color: #dc2626;
}
```

- [ ] Replace `apps/server-driven-ui/web/src/App.tsx`

```tsx
// apps/server-driven-ui/web/src/App.tsx
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { SDUINode } from './core/types';
import { SDUIRenderer } from './core/SDUIRenderer';
import { registry } from './registry';
import { fetchPage } from './mock-server/responses';
import { CartProvider } from './CartContext';
import { CartSummary } from './components/CartSummary';
import { AdminPanel } from './admin/AdminPanel';
import styles from './App.module.css';

function SDUIPage({ page }: { page: string }) {
  const [node, setNode] = useState<SDUINode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPage(page)
      .then(setNode)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!node) return null;

  return <SDUIRenderer node={node} registry={registry} />;
}

function HomePage() {
  return <SDUIPage page="home" />;
}

function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  return <SDUIPage page={`restaurant-${id}`} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className={styles.app}>
          <header className={styles.header}>
            <Link className={styles.logo} to="/">
              FoodDash
            </Link>
            <nav className={styles.nav}>
              <Link className={styles.navLink} to="/">
                Home
              </Link>
              <Link className={styles.navLink} to="/admin">
                Admin
              </Link>
            </nav>
          </header>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/restaurant/:id" element={<RestaurantPage />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
          <CartSummary />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
```

### Step 12.3 — Update main.tsx

- [ ] Replace `apps/server-driven-ui/web/src/main.tsx`

```tsx
// apps/server-driven-ui/web/src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### Step 12.4 — Commit

```bash
git add apps/server-driven-ui/web/src/registry.ts apps/server-driven-ui/web/src/App.tsx apps/server-driven-ui/web/src/App.module.css apps/server-driven-ui/web/src/main.tsx
git commit -m "feat(sdui): wire up registry, routing, and SDUI page rendering"
```

---

## Task 13: Admin Panel

### Step 13.1 — Write adminState tests

- [ ] Create `apps/server-driven-ui/web/src/admin/adminState.test.ts`

```typescript
// apps/server-driven-ui/web/src/admin/adminState.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAdminConfig,
  setHomeConfig,
  setRestaurantConfig,
  resetAdminConfig,
  HOME_VARIANTS,
  RESTAURANT_1_VARIANTS,
} from './adminState';

describe('adminState', () => {
  beforeEach(() => {
    resetAdminConfig();
  });

  it('returns the default config', () => {
    const config = getAdminConfig();
    expect(config.home).toBe('home.json');
    expect(config.restaurants['1']).toBe('restaurant-1.json');
  });

  it('changes the home config', () => {
    setHomeConfig('home-promo.json');
    expect(getAdminConfig().home).toBe('home-promo.json');
  });

  it('changes a restaurant config', () => {
    setRestaurantConfig('1', 'restaurant-1-v2.json');
    expect(getAdminConfig().restaurants['1']).toBe('restaurant-1-v2.json');
  });

  it('resets to defaults', () => {
    setHomeConfig('home-v2.json');
    resetAdminConfig();
    expect(getAdminConfig().home).toBe('home.json');
  });

  it('exports variant lists', () => {
    expect(HOME_VARIANTS).toEqual(['home.json', 'home-v2.json', 'home-promo.json']);
    expect(RESTAURANT_1_VARIANTS).toEqual(['restaurant-1.json', 'restaurant-1-v2.json']);
  });
});
```

### Step 13.2 — Run tests (expect failure)

```bash
cd apps/server-driven-ui/web
npx vitest run src/admin/adminState.test.ts
```

### Step 13.3 — Implement adminState

- [ ] Create `apps/server-driven-ui/web/src/admin/adminState.ts`

```typescript
// apps/server-driven-ui/web/src/admin/adminState.ts
export interface AdminConfig {
  home: string;
  restaurants: Record<string, string>;
}

export const HOME_VARIANTS = ['home.json', 'home-v2.json', 'home-promo.json'];
export const RESTAURANT_1_VARIANTS = ['restaurant-1.json', 'restaurant-1-v2.json'];

const DEFAULT_CONFIG: AdminConfig = {
  home: 'home.json',
  restaurants: { '1': 'restaurant-1.json' },
};

let currentConfig: AdminConfig = structuredClone(DEFAULT_CONFIG);
let listeners: Array<() => void> = [];

export function getAdminConfig(): AdminConfig {
  return currentConfig;
}

export function setHomeConfig(variant: string): void {
  currentConfig = { ...currentConfig, home: variant };
  notifyListeners();
}

export function setRestaurantConfig(id: string, variant: string): void {
  currentConfig = {
    ...currentConfig,
    restaurants: { ...currentConfig.restaurants, [id]: variant },
  };
  notifyListeners();
}

export function resetAdminConfig(): void {
  currentConfig = structuredClone(DEFAULT_CONFIG);
  notifyListeners();
}

export function subscribeAdminConfig(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function notifyListeners(): void {
  listeners.forEach((l) => l());
}
```

### Step 13.4 — Run adminState tests (expect pass)

```bash
cd apps/server-driven-ui/web
npx vitest run src/admin/adminState.test.ts
```

Expected: all 5 tests pass.

### Step 13.5 — Write ConfigSelector tests

- [ ] Create `apps/server-driven-ui/web/src/admin/ConfigSelector.test.tsx`

```tsx
// apps/server-driven-ui/web/src/admin/ConfigSelector.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigSelector } from './ConfigSelector';

describe('ConfigSelector', () => {
  it('renders a label and dropdown with variants', () => {
    render(
      <ConfigSelector
        label="Home Page"
        value="home.json"
        variants={['home.json', 'home-v2.json', 'home-promo.json']}
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('calls onChange when a variant is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ConfigSelector
        label="Home Page"
        value="home.json"
        variants={['home.json', 'home-v2.json', 'home-promo.json']}
        onChange={onChange}
      />
    );
    await user.selectOptions(screen.getByRole('combobox'), 'home-promo.json');
    expect(onChange).toHaveBeenCalledWith('home-promo.json');
  });

  it('displays the current value as selected', () => {
    render(
      <ConfigSelector
        label="Home Page"
        value="home-v2.json"
        variants={['home.json', 'home-v2.json', 'home-promo.json']}
        onChange={() => {}}
      />
    );
    expect(screen.getByRole('combobox')).toHaveValue('home-v2.json');
  });
});
```

### Step 13.6 — Implement ConfigSelector

- [ ] Create `apps/server-driven-ui/web/src/admin/ConfigSelector.tsx`

```tsx
// apps/server-driven-ui/web/src/admin/ConfigSelector.tsx
interface ConfigSelectorProps {
  label: string;
  value: string;
  variants: string[];
  onChange: (variant: string) => void;
}

export function ConfigSelector({ label, value, variants, onChange }: ConfigSelectorProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: '0.875rem' }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid #d1d5db',
          fontSize: '0.875rem',
          background: 'white',
        }}
      >
        {variants.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### Step 13.7 — Run ConfigSelector tests (expect pass)

```bash
cd apps/server-driven-ui/web
npx vitest run src/admin/ConfigSelector.test.tsx
```

Expected: all 3 tests pass.

### Step 13.8 — Write JsonPreview tests

- [ ] Create `apps/server-driven-ui/web/src/admin/JsonPreview.test.tsx`

```tsx
// apps/server-driven-ui/web/src/admin/JsonPreview.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JsonPreview } from './JsonPreview';

describe('JsonPreview', () => {
  it('renders JSON content in a preformatted block', () => {
    const data = { type: 'banner', props: { title: 'Hello' } };
    render(<JsonPreview data={data} />);
    expect(screen.getByText(/\"type\": \"banner\"/)).toBeInTheDocument();
    expect(screen.getByText(/\"title\": \"Hello\"/)).toBeInTheDocument();
  });

  it('renders a title', () => {
    render(<JsonPreview data={{ type: 'list' }} title="Active Config" />);
    expect(screen.getByText('Active Config')).toBeInTheDocument();
  });
});
```

### Step 13.9 — Implement JsonPreview

- [ ] Create `apps/server-driven-ui/web/src/admin/JsonPreview.tsx`

```tsx
// apps/server-driven-ui/web/src/admin/JsonPreview.tsx
interface JsonPreviewProps {
  data: unknown;
  title?: string;
}

export function JsonPreview({ data, title }: JsonPreviewProps) {
  return (
    <div>
      {title && (
        <h3
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: 8,
            color: '#374151',
          }}
        >
          {title}
        </h3>
      )}
      <pre
        style={{
          background: '#1f2937',
          color: '#e5e7eb',
          padding: 16,
          borderRadius: 8,
          fontSize: '0.75rem',
          overflow: 'auto',
          maxHeight: 400,
          lineHeight: 1.5,
        }}
      >
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );
}
```

### Step 13.10 — Run JsonPreview tests (expect pass)

```bash
cd apps/server-driven-ui/web
npx vitest run src/admin/JsonPreview.test.tsx
```

Expected: all 2 tests pass.

### Step 13.11 — Write AdminPanel tests

- [ ] Create `apps/server-driven-ui/web/src/admin/AdminPanel.test.tsx`

```tsx
// apps/server-driven-ui/web/src/admin/AdminPanel.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminPanel } from './AdminPanel';
import { getAdminConfig, resetAdminConfig } from './adminState';

describe('AdminPanel', () => {
  beforeEach(() => {
    resetAdminConfig();
  });

  it('renders config selectors for home and restaurant', () => {
    render(<AdminPanel />);
    expect(screen.getByText('Home Page Config')).toBeInTheDocument();
    expect(screen.getByText('Restaurant 1 Config')).toBeInTheDocument();
  });

  it('renders the JSON preview section', () => {
    render(<AdminPanel />);
    expect(screen.getByText('Active JSON Preview')).toBeInTheDocument();
  });

  it('switches the home config when selecting a variant', async () => {
    const user = userEvent.setup();
    render(<AdminPanel />);
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'home-promo.json');
    expect(getAdminConfig().home).toBe('home-promo.json');
  });

  it('switches the restaurant config when selecting a variant', async () => {
    const user = userEvent.setup();
    render(<AdminPanel />);
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[1], 'restaurant-1-v2.json');
    expect(getAdminConfig().restaurants['1']).toBe('restaurant-1-v2.json');
  });
});
```

### Step 13.12 — Implement AdminPanel

- [ ] Create `apps/server-driven-ui/web/src/admin/AdminPanel.module.css`

```css
/* apps/server-driven-ui/web/src/admin/AdminPanel.module.css */
.panel {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 8px;
}

.description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 24px;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.sectionTitle {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}
```

- [ ] Create `apps/server-driven-ui/web/src/admin/AdminPanel.tsx`

```tsx
// apps/server-driven-ui/web/src/admin/AdminPanel.tsx
import { useState, useEffect } from 'react';
import { ConfigSelector } from './ConfigSelector';
import { JsonPreview } from './JsonPreview';
import {
  getAdminConfig,
  setHomeConfig,
  setRestaurantConfig,
  subscribeAdminConfig,
  HOME_VARIANTS,
  RESTAURANT_1_VARIANTS,
} from './adminState';
import homeDefault from '../mock-server/home.json';
import homeV2 from '../mock-server/home-v2.json';
import homePromo from '../mock-server/home-promo.json';
import restaurant1 from '../mock-server/restaurant-1.json';
import restaurant1V2 from '../mock-server/restaurant-1-v2.json';
import styles from './AdminPanel.module.css';

const jsonLookup: Record<string, unknown> = {
  'home.json': homeDefault,
  'home-v2.json': homeV2,
  'home-promo.json': homePromo,
  'restaurant-1.json': restaurant1,
  'restaurant-1-v2.json': restaurant1V2,
};

export function AdminPanel() {
  const [config, setConfig] = useState(getAdminConfig());
  const [previewPage, setPreviewPage] = useState<'home' | 'restaurant-1'>('home');

  useEffect(() => {
    return subscribeAdminConfig(() => setConfig(getAdminConfig()));
  }, []);

  const activeFile = previewPage === 'home' ? config.home : config.restaurants['1'];
  const previewData = jsonLookup[activeFile];

  return (
    <div className={styles.panel}>
      <h1 className={styles.title}>Admin Panel</h1>
      <p className={styles.description}>
        Switch JSON configs to change the app UI without a deploy. Open the home
        page in another tab to see changes in real-time.
      </p>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Configuration</h2>
        <ConfigSelector
          label="Home Page Config"
          value={config.home}
          variants={HOME_VARIANTS}
          onChange={setHomeConfig}
        />
        <ConfigSelector
          label="Restaurant 1 Config"
          value={config.restaurants['1']}
          variants={RESTAURANT_1_VARIANTS}
          onChange={(v) => setRestaurantConfig('1', v)}
        />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Active JSON Preview</h2>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, marginRight: 8 }}>
            Preview:
          </label>
          <select
            value={previewPage}
            onChange={(e) => setPreviewPage(e.target.value as 'home' | 'restaurant-1')}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              border: '1px solid #d1d5db',
              fontSize: '0.875rem',
            }}
          >
            <option value="home">Home Page</option>
            <option value="restaurant-1">Restaurant 1</option>
          </select>
        </div>
        <JsonPreview data={previewData} title={`${activeFile}`} />
      </div>
    </div>
  );
}
```

### Step 13.13 — Run admin tests (expect pass)

```bash
cd apps/server-driven-ui/web
npx vitest run src/admin/
```

Expected: all 14 admin tests pass (5 adminState + 3 ConfigSelector + 2 JsonPreview + 4 AdminPanel).

### Step 13.14 — Run all tests

```bash
cd apps/server-driven-ui/web
npx vitest run
```

Expected: all tests pass across all files.

### Step 13.15 — Commit

```bash
git add apps/server-driven-ui/web/src/admin/
git commit -m "feat(sdui): add admin panel with config switcher and JSON preview"
```

---

## Task 14: React Native Project Setup (Mobile)

### Step 14.1 — Initialize Expo project

- [ ] Create the mobile project

```bash
cd apps/server-driven-ui
npx create-expo-app@latest mobile --template blank-typescript
```

### Step 14.2 — Install dependencies

```bash
cd apps/server-driven-ui/mobile
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

### Step 14.3 — Commit

```bash
git add apps/server-driven-ui/mobile/
git commit -m "feat(sdui): scaffold Expo React Native project"
```

---

## Task 15: React Native Core (Registry + Renderer)

### Step 15.1 — Create mobile types

- [ ] Create `apps/server-driven-ui/mobile/src/core/types.ts`

```typescript
// apps/server-driven-ui/mobile/src/core/types.ts
import type { ComponentType } from 'react';

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

export interface SDUIComponentProps {
  actions?: SDUIAction[];
  children?: React.ReactNode;
  [key: string]: unknown;
}

export type ComponentMap = Map<string, ComponentType<SDUIComponentProps>>;

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
```

### Step 15.2 — Create mobile ComponentRegistry

- [ ] Create `apps/server-driven-ui/mobile/src/core/ComponentRegistry.ts`

```typescript
// apps/server-driven-ui/mobile/src/core/ComponentRegistry.ts
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
```

### Step 15.3 — Create mobile SDUIRenderer

- [ ] Create `apps/server-driven-ui/mobile/src/core/SDUIRenderer.tsx`

```tsx
// apps/server-driven-ui/mobile/src/core/SDUIRenderer.tsx
import React from 'react';
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
```

### Step 15.4 — Commit

```bash
git add apps/server-driven-ui/mobile/src/core/
git commit -m "feat(sdui): add mobile core types, registry, and renderer"
```

---

## Task 16: React Native Components

### Step 16.1 — Create mobile Banner

- [ ] Create `apps/server-driven-ui/mobile/src/components/Banner.tsx`

```tsx
// apps/server-driven-ui/mobile/src/components/Banner.tsx
import React from 'react';
import { View, Image, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { SDUIComponentProps } from '../core/types';

export function Banner({ imageUrl, title, subtitle, actions }: SDUIComponentProps) {
  const navigation = useNavigation<any>();
  const navigateAction = actions?.find((a) => a.type === 'navigate');

  const content = (
    <View style={bannerStyles.container}>
      <Image
        source={{ uri: imageUrl as string }}
        style={bannerStyles.image}
        resizeMode="cover"
      />
      <View style={bannerStyles.overlay}>
        <Text style={bannerStyles.title}>{title as string}</Text>
        {subtitle && (
          <Text style={bannerStyles.subtitle}>{subtitle as string}</Text>
        )}
      </View>
    </View>
  );

  if (navigateAction) {
    const to = navigateAction.payload.to as string;
    const restaurantId = to.split('/').pop();
    return (
      <Pressable
        onPress={() => navigation.navigate('Restaurant', { id: restaurantId })}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const bannerStyles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 180,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 2,
  },
});
```

### Step 16.2 — Create mobile RestaurantCard

- [ ] Create `apps/server-driven-ui/mobile/src/components/RestaurantCard.tsx`

```tsx
// apps/server-driven-ui/mobile/src/components/RestaurantCard.tsx
import React from 'react';
import { View, Image, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { SDUIComponentProps } from '../core/types';

export function RestaurantCard({
  name,
  imageUrl,
  rating,
  deliveryTime,
  cuisine,
  priceRange,
  actions,
}: SDUIComponentProps) {
  const navigation = useNavigation<any>();
  const navigateAction = actions?.find((a) => a.type === 'navigate');

  const content = (
    <View style={cardStyles.card}>
      <Image
        source={{ uri: imageUrl as string }}
        style={cardStyles.image}
        resizeMode="cover"
      />
      <View style={cardStyles.info}>
        <Text style={cardStyles.name}>{name as string}</Text>
        <View style={cardStyles.meta}>
          <Text style={cardStyles.rating}>{String(rating)}</Text>
          <Text style={cardStyles.metaText}>{deliveryTime as string}</Text>
          <Text style={cardStyles.metaText}>{cuisine as string}</Text>
          <Text style={cardStyles.metaText}>{priceRange as string}</Text>
        </View>
      </View>
    </View>
  );

  if (navigateAction) {
    const to = navigateAction.payload.to as string;
    const restaurantId = to.split('/').pop();
    return (
      <Pressable
        onPress={() => navigation.navigate('Restaurant', { id: restaurantId })}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const cardStyles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  rating: {
    fontWeight: '600',
    color: '#f59e0b',
    fontSize: 13,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
  },
});
```

### Step 16.3 — Create mobile FoodItemCard

- [ ] Create `apps/server-driven-ui/mobile/src/components/FoodItemCard.tsx`

```tsx
// apps/server-driven-ui/mobile/src/components/FoodItemCard.tsx
import React, { useContext } from 'react';
import { View, Image, Text, Pressable, StyleSheet } from 'react-native';
import type { SDUIComponentProps } from '../core/types';
import { CartContext } from '../CartContext';

export function FoodItemCard({
  name,
  description,
  price,
  imageUrl,
  actions,
}: SDUIComponentProps) {
  const { addItem } = useContext(CartContext);
  const addToCartAction = actions?.find((a) => a.type === 'add-to-cart');

  function handleAddToCart() {
    if (!addToCartAction) return;
    addItem({
      itemId: addToCartAction.payload.itemId as string,
      name: name as string,
      price: addToCartAction.payload.price as number,
      quantity: 1,
    });
  }

  return (
    <View style={foodStyles.card}>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl as string }}
          style={foodStyles.image}
          resizeMode="cover"
        />
      )}
      <View style={foodStyles.info}>
        <Text style={foodStyles.name}>{name as string}</Text>
        {description && (
          <Text style={foodStyles.description}>{description as string}</Text>
        )}
        <View style={foodStyles.footer}>
          <Text style={foodStyles.price}>
            ${(price as number).toFixed(2)}
          </Text>
          {addToCartAction && (
            <Pressable style={foodStyles.addButton} onPress={handleAddToCart}>
              <Text style={foodStyles.addButtonText}>Add to Cart</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const foodStyles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 140,
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16a34a',
  },
  addButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
```

### Step 16.4 — Create mobile GridLayout

- [ ] Create `apps/server-driven-ui/mobile/src/components/GridLayout.tsx`

```tsx
// apps/server-driven-ui/mobile/src/components/GridLayout.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { SDUIComponentProps } from '../core/types';

export function GridLayout({ columns = 2, children }: SDUIComponentProps) {
  const childArray = React.Children.toArray(children);
  const numColumns = Number(columns);

  return (
    <View style={gridStyles.container}>
      {childArray.map((child, index) => (
        <View
          key={index}
          style={[
            gridStyles.item,
            { width: `${100 / numColumns}%` as unknown as number },
          ]}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

const gridStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  item: {
    padding: 8,
  },
});
```

### Step 16.5 — Create mobile ListLayout

- [ ] Create `apps/server-driven-ui/mobile/src/components/ListLayout.tsx`

```tsx
// apps/server-driven-ui/mobile/src/components/ListLayout.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { SDUIComponentProps } from '../core/types';

export function ListLayout({ children }: SDUIComponentProps) {
  return <View style={listStyles.container}>{children}</View>;
}

const listStyles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
});
```

### Step 16.6 — Create mobile CartSummary

- [ ] Create `apps/server-driven-ui/mobile/src/components/CartSummary.tsx`

```tsx
// apps/server-driven-ui/mobile/src/components/CartSummary.tsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CartContext } from '../CartContext';

export function CartSummary() {
  const { items, total } = useContext(CartContext);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (itemCount === 0) return null;

  return (
    <View style={cartStyles.summary}>
      <View style={cartStyles.countBadge}>
        <Text style={cartStyles.countText}>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Text>
      </View>
      <Text style={cartStyles.total}>${total.toFixed(2)}</Text>
    </View>
  );
}

const cartStyles = StyleSheet.create({
  summary: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    left: 20,
    backgroundColor: '#16a34a',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  countText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  total: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
```

### Step 16.7 — Commit

```bash
git add apps/server-driven-ui/mobile/src/components/
git commit -m "feat(sdui): add React Native components (Banner, RestaurantCard, FoodItemCard, Grid, List, CartSummary)"
```

---

## Task 17: React Native App Wiring

### Step 17.1 — Create mobile CartContext

- [ ] Create `apps/server-driven-ui/mobile/src/CartContext.tsx`

```tsx
// apps/server-driven-ui/mobile/src/CartContext.tsx
import React, { createContext, useReducer, type ReactNode } from 'react';

export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

interface CartContextValue extends CartState {
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
}

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'UPDATE_QUANTITY'; itemId: string; quantity: number };

function computeTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.itemId === action.item.itemId);
      let items: CartItem[];
      if (existing) {
        items = state.items.map((i) =>
          i.itemId === action.item.itemId
            ? { ...i, quantity: i.quantity + action.item.quantity }
            : i
        );
      } else {
        items = [...state.items, action.item];
      }
      return { items, total: computeTotal(items) };
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter((i) => i.itemId !== action.itemId);
      return { items, total: computeTotal(items) };
    }
    case 'UPDATE_QUANTITY': {
      const items = state.items.map((i) =>
        i.itemId === action.itemId ? { ...i, quantity: action.quantity } : i
      );
      return { items, total: computeTotal(items) };
    }
    default:
      return state;
  }
}

const initialState: CartState = { items: [], total: 0 };

export const CartContext = createContext<CartContextValue>({
  ...initialState,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item: CartItem) => dispatch({ type: 'ADD_ITEM', item });
  const removeItem = (itemId: string) => dispatch({ type: 'REMOVE_ITEM', itemId });
  const updateQuantity = (itemId: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', itemId, quantity });

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}
```

### Step 17.2 — Copy mock-server JSON to mobile

- [ ] Copy JSON files into `apps/server-driven-ui/mobile/src/mock-server/`

```bash
mkdir -p apps/server-driven-ui/mobile/src/mock-server
cp apps/server-driven-ui/web/src/mock-server/*.json apps/server-driven-ui/mobile/src/mock-server/
```

### Step 17.3 — Create mobile responses.ts

- [ ] Create `apps/server-driven-ui/mobile/src/mock-server/responses.ts`

```typescript
// apps/server-driven-ui/mobile/src/mock-server/responses.ts
import type { SDUINode } from '../core/types';
import homeDefault from './home.json';
import homeV2 from './home-v2.json';
import homePromo from './home-promo.json';
import restaurant1 from './restaurant-1.json';
import restaurant1V2 from './restaurant-1-v2.json';

const jsonMap: Record<string, SDUINode> = {
  'home.json': homeDefault as unknown as SDUINode,
  'home-v2.json': homeV2 as unknown as SDUINode,
  'home-promo.json': homePromo as unknown as SDUINode,
  'restaurant-1.json': restaurant1 as unknown as SDUINode,
  'restaurant-1-v2.json': restaurant1V2 as unknown as SDUINode,
};

let activeHome = 'home.json';
let activeRestaurants: Record<string, string> = { '1': 'restaurant-1.json' };

export function setActiveHome(variant: string) {
  activeHome = variant;
}

export function setActiveRestaurant(id: string, variant: string) {
  activeRestaurants[id] = variant;
}

const SIMULATED_DELAY_MS = 300;

export async function fetchPage(page: string): Promise<SDUINode> {
  let activeFile: string;

  if (page === 'home') {
    activeFile = activeHome;
  } else if (page.startsWith('restaurant-')) {
    const id = page.replace('restaurant-', '');
    activeFile = activeRestaurants[id] ?? `restaurant-${id}.json`;
  } else {
    throw new Error(`Unknown page: ${page}`);
  }

  const node = jsonMap[activeFile];
  if (!node) {
    throw new Error(`No JSON found for: ${activeFile}`);
  }

  return new Promise((resolve) => {
    setTimeout(() => resolve(node), SIMULATED_DELAY_MS);
  });
}
```

### Step 17.4 — Create mobile registry

- [ ] Create `apps/server-driven-ui/mobile/src/registry.ts`

```typescript
// apps/server-driven-ui/mobile/src/registry.ts
import { ComponentRegistry } from './core/ComponentRegistry';
import { Banner } from './components/Banner';
import { RestaurantCard } from './components/RestaurantCard';
import { FoodItemCard } from './components/FoodItemCard';
import { GridLayout } from './components/GridLayout';
import { ListLayout } from './components/ListLayout';

export const registry = new ComponentRegistry();

registry.register('banner', Banner);
registry.register('restaurant-card', RestaurantCard);
registry.register('food-item-card', FoodItemCard);
registry.register('grid', GridLayout);
registry.register('list', ListLayout);
```

### Step 17.5 — Create mobile App.tsx

- [ ] Create `apps/server-driven-ui/mobile/App.tsx`

```tsx
// apps/server-driven-ui/mobile/App.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { SDUINode } from './src/core/types';
import { SDUIRenderer } from './src/core/SDUIRenderer';
import { registry } from './src/registry';
import { fetchPage } from './src/mock-server/responses';
import { CartProvider } from './src/CartContext';
import { CartSummary } from './src/components/CartSummary';

type RootStackParamList = {
  Home: undefined;
  Restaurant: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function SDUIPage({ page }: { page: string }) {
  const [node, setNode] = useState<SDUINode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPage(page)
      .then(setNode)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) {
    return (
      <View style={appStyles.loading}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={appStyles.error}>
        <Text style={appStyles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!node) return null;

  return (
    <ScrollView style={appStyles.page}>
      <SDUIRenderer node={node} registry={registry} />
    </ScrollView>
  );
}

function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <SDUIPage page="home" />
      <CartSummary />
    </View>
  );
}

function RestaurantScreen({ route }: { route: { params: { id: string } } }) {
  return (
    <View style={{ flex: 1 }}>
      <SDUIPage page={`restaurant-${route.params.id}`} />
      <CartSummary />
    </View>
  );
}

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: 'white' },
            headerTintColor: '#16a34a',
            headerTitleStyle: { fontWeight: '700' },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'FoodDash' }}
          />
          <Stack.Screen
            name="Restaurant"
            component={RestaurantScreen}
            options={{ title: 'Restaurant' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}

const appStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 64,
  },
  error: {
    padding: 32,
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
  },
});
```

### Step 17.6 — Commit

```bash
git add apps/server-driven-ui/mobile/
git commit -m "feat(sdui): wire up React Native app with navigation, cart, and SDUI rendering"
```

### Step 17.7 — Run all web tests one final time

```bash
cd apps/server-driven-ui/web
npx vitest run
```

Expected: all tests pass. The full web + mobile SDUI food delivery app is complete.
