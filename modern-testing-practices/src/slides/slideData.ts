// Modern Testing Practices - Slide Data

export type SlideContent =
  | { type: 'text'; value: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'code'; value: string }
  | { type: 'diagram'; value: string }
  | { type: 'image'; src: string; alt: string; maxHeight?: string }
  | { type: 'comparison'; left: { title: string; items: string[] }; right: { title: string; items: string[] } }
  | { type: 'steps'; items: { title: string; description: string }[] };

export interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  content: SlideContent[];
}

export const categories = [
  'Introduction',
  'Testing Philosophy',
  'Test Types',
  'Unit Testing',
  'Component Testing',
  'Integration Testing',
  'E2E Testing',
  'Visual Testing',
  'AI & Testing',
  'Mutation Testing',
  'Modern Practices',
  'Summary',
];

export const slides: Slide[] = [
  // ==================== INTRO ====================
  {
    id: 'intro',
    title: 'Modern Testing Practices',
    subtitle: 'Building Confidence in Your Code',
    category: 'Introduction',
    content: [
      { type: 'text', value: 'Testing has evolved significantly. Let\'s explore what works in 2026 and beyond.' },
      { type: 'bullets', items: [
        'The Testing Trophy vs Testing Pyramid',
        'Types of Tests: Unit, Component, Integration, E2E',
        'Storybook for Component Development',
        'Playwright for Modern E2E',
        'Visual Regression Testing',
        'AI-Assisted Test Generation',
        'Mutation Testing for Test Quality',
      ]},
    ],
  },

  // ==================== TESTING PHILOSOPHY ====================
  {
    id: 'testing-pyramid',
    title: 'The Testing Pyramid',
    subtitle: 'Traditional Approach',
    category: 'Testing Philosophy',
    content: [
      { type: 'text', value: 'The classic model emphasized many unit tests at the base, fewer integration tests, and even fewer E2E tests.' },
      { type: 'image', src: '/images/testing-pyramid.svg', alt: 'Testing Pyramid', maxHeight: '280px' },
      { type: 'bullets', items: [
        'Unit tests: Fast, isolated, test individual functions',
        'Integration tests: Test modules working together',
        'E2E tests: Full user journey, slowest but most realistic',
      ]},
    ],
  },
  {
    id: 'testing-trophy',
    title: 'The Testing Trophy',
    subtitle: 'Modern Approach by Kent C. Dodds',
    category: 'Testing Philosophy',
    content: [
      { type: 'text', value: 'The Testing Trophy emphasizes integration tests as the sweet spot for confidence.' },
      { type: 'image', src: '/images/testing-trophy.svg', alt: 'Testing Trophy', maxHeight: '320px' },
      { type: 'bullets', items: [
        'Static: TypeScript, ESLint catch bugs before runtime',
        'Unit: Small, pure functions (utils, helpers)',
        'Integration: Components with context, mocked APIs',
        'E2E: Critical user paths only',
      ]},
    ],
  },
  {
    id: 'trophy-rationale',
    title: 'Why the Trophy?',
    subtitle: 'Integration Tests Give Best ROI',
    category: 'Testing Philosophy',
    content: [
      { type: 'comparison',
        left: { title: 'Unit Tests', items: [
          'Test implementation details',
          'Break when refactoring',
          'False confidence',
          'Can\'t catch integration bugs',
          'Easy to write, but miss real issues',
        ]},
        right: { title: 'Integration Tests', items: [
          'Test user behavior',
          'Survive refactoring',
          'Real confidence',
          'Catch how pieces work together',
          'More valuable per test written',
        ]}
      },
      { type: 'text', value: '"Write tests. Not too many. Mostly integration." - Guillermo Rauch' },
    ],
  },
  {
    id: 'what-to-test',
    title: 'What to Test?',
    subtitle: 'Focus on User Behavior',
    category: 'Testing Philosophy',
    content: [
      { type: 'text', value: 'Test from the user\'s perspective, not implementation details.' },
      { type: 'comparison',
        left: { title: 'Good Tests', items: [
          'User can submit the form',
          'Error message appears for invalid input',
          'Data loads and displays correctly',
          'User can navigate between pages',
          'Accessibility: screen reader compatibility',
        ]},
        right: { title: 'Avoid Testing', items: [
          'Internal state shape',
          'Component lifecycle methods',
          'CSS class names',
          'Implementation-specific selectors',
          'Third-party library internals',
        ]}
      },
    ],
  },

  // ==================== TEST TYPES ====================
  {
    id: 'test-types-overview',
    title: 'Test Types Overview',
    subtitle: 'The Modern Testing Landscape',
    category: 'Test Types',
    content: [
      { type: 'bullets', items: [
        'Static Analysis - TypeScript, ESLint, Prettier',
        'Unit Tests - Pure functions, utilities, hooks',
        'Component Tests - Isolated components with mocks',
        'Integration Tests - Multiple components, real context',
        'E2E Tests - Full browser, real (or mock) backend',
        'Visual Tests - Screenshot comparisons',
        'Accessibility Tests - axe, WAVE, screen readers',
        'Performance Tests - Lighthouse, Web Vitals',
      ]},
    ],
  },
  {
    id: 'choosing-test-type',
    title: 'Choosing the Right Test',
    subtitle: 'Decision Framework',
    category: 'Test Types',
    content: [
      { type: 'steps', items: [
        { title: 'Pure Logic?', description: 'Use unit tests. formatDate(), calculateTotal(), validators.' },
        { title: 'Single Component UI?', description: 'Use component tests with Testing Library or Storybook.' },
        { title: 'Multiple Components Together?', description: 'Use integration tests with mocked APIs.' },
        { title: 'Critical User Flow?', description: 'Use E2E with Playwright for login, checkout, etc.' },
        { title: 'Visual Consistency?', description: 'Use visual regression tests with Percy, Chromatic, or Playwright screenshots.' },
      ]},
    ],
  },

  // ==================== UNIT TESTING ====================
  {
    id: 'unit-testing',
    title: 'Unit Testing',
    subtitle: 'Testing Pure Functions',
    category: 'Unit Testing',
    content: [
      { type: 'text', value: 'Unit tests are best for pure functions with no side effects.' },
      { type: 'code', value: `// utils/formatters.ts
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// utils/formatters.test.ts
import { formatCurrency } from './formatters';

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
});` },
    ],
  },
  {
    id: 'testing-hooks',
    title: 'Testing Custom Hooks',
    subtitle: 'Using renderHook from Testing Library',
    category: 'Unit Testing',
    content: [
      { type: 'code', value: `// hooks/useCounter.ts
import { useState, useCallback } from 'react';

export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initial), [initial]);
  
  return { count, increment, decrement, reset };
}

// hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

test('increments counter', () => {
  const { result } = renderHook(() => useCounter(0));
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});` },
    ],
  },

  // ==================== COMPONENT TESTING ====================
  {
    id: 'component-testing',
    title: 'Component Testing',
    subtitle: 'Testing React Components in Isolation',
    category: 'Component Testing',
    content: [
      { type: 'text', value: 'Component tests render a single component and test its behavior.' },
      { type: 'code', value: `// components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});` },
    ],
  },
  {
    id: 'testing-library-queries',
    title: 'Testing Library Queries',
    subtitle: 'Query Priority for Accessible Tests',
    category: 'Component Testing',
    content: [
      { type: 'text', value: 'Use queries that reflect how users interact with your app.' },
      { type: 'steps', items: [
        { title: 'getByRole', description: 'Best! Tests accessibility. getByRole("button", { name: /submit/i })' },
        { title: 'getByLabelText', description: 'For form fields. getByLabelText(/email/i)' },
        { title: 'getByPlaceholderText', description: 'When label isn\'t available.' },
        { title: 'getByText', description: 'For non-interactive elements. getByText(/welcome/i)' },
        { title: 'getByTestId', description: 'Last resort! Only when nothing else works.' },
      ]},
      { type: 'text', value: 'Avoid: getByClassName, querySelector - these test implementation, not behavior.' },
    ],
  },
  {
    id: 'storybook-intro',
    title: 'Storybook',
    subtitle: 'Component Development & Documentation',
    category: 'Component Testing',
    content: [
      { type: 'text', value: 'Storybook is a tool for building UI components in isolation.' },
      { type: 'bullets', items: [
        'Develop components without running the full app',
        'Document all component states visually',
        'Interactive playground for designers and devs',
        'Built-in accessibility checks',
        'Visual regression testing with Chromatic',
        'Run interaction tests in the browser',
      ]},
      { type: 'code', value: `// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: 'Click me', variant: 'primary' },
};

export const Loading: Story = {
  args: { children: 'Submitting...', loading: true },
};` },
    ],
  },
  {
    id: 'storybook-testing',
    title: 'Storybook Interaction Tests',
    subtitle: 'Testing in the Browser',
    category: 'Component Testing',
    content: [
      { type: 'text', value: 'Storybook can run interaction tests right in the browser.' },
      { type: 'code', value: `// Button.stories.tsx
import { within, userEvent, expect } from '@storybook/test';

export const ClickTest: Story = {
  args: { children: 'Click me' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    // Test initial state
    await expect(button).toBeEnabled();
    
    // Simulate user interaction
    await userEvent.click(button);
    
    // Assert result
    await expect(button).toHaveTextContent('Clicked!');
  },
};` },
      { type: 'bullets', items: [
        'Tests run in real browser, not JSDOM',
        'Watch mode - see tests run visually',
        'Same syntax as Testing Library',
        'Great for debugging complex interactions',
      ]},
    ],
  },

  // ==================== INTEGRATION TESTING ====================
  {
    id: 'integration-testing',
    title: 'Integration Testing',
    subtitle: 'The Sweet Spot',
    category: 'Integration Testing',
    content: [
      { type: 'text', value: 'Integration tests verify multiple components work together correctly.' },
      { type: 'code', value: `// features/TodoApp.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoApp } from './TodoApp';
import { TodoProvider } from './TodoContext';

// Mock the API
vi.mock('../api/todos', () => ({
  fetchTodos: vi.fn(() => Promise.resolve([
    { id: 1, text: 'Existing todo', completed: false },
  ])),
  addTodo: vi.fn((text) => Promise.resolve({ id: 2, text, completed: false })),
}));

test('user can add a new todo', async () => {
  render(<TodoProvider><TodoApp /></TodoProvider>);
  
  // Wait for initial load
  await screen.findByText('Existing todo');
  
  // Add new todo
  await userEvent.type(screen.getByRole('textbox'), 'New todo');
  await userEvent.click(screen.getByRole('button', { name: /add/i }));
  
  // Verify it appears
  await waitFor(() => {
    expect(screen.getByText('New todo')).toBeInTheDocument();
  });
});` },
    ],
  },
  {
    id: 'mocking-apis',
    title: 'Mocking APIs',
    subtitle: 'MSW - Mock Service Worker',
    category: 'Integration Testing',
    content: [
      { type: 'text', value: 'MSW intercepts network requests and returns mock responses.' },
      { type: 'code', value: `// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ]);
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 3, ...body }, { status: 201 });
  }),

  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, name: 'John' });
  }),
];

// test-setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());` },
    ],
  },

  // ==================== E2E TESTING ====================
  {
    id: 'e2e-testing',
    title: 'E2E Testing',
    subtitle: 'Full Browser Automation',
    category: 'E2E Testing',
    content: [
      { type: 'text', value: 'E2E tests run in a real browser against your actual application.' },
      { type: 'comparison',
        left: { title: 'When to Use E2E', items: [
          'Critical user journeys',
          'Payment/checkout flows',
          'Authentication',
          'Multi-page workflows',
          'Cross-browser testing',
        ]},
        right: { title: 'E2E Challenges', items: [
          'Slower than other tests',
          'More flaky if not careful',
          'Require running server',
          'Harder to debug',
          'Need test data setup',
        ]}
      },
    ],
  },
  {
    id: 'playwright-intro',
    title: 'Playwright',
    subtitle: 'Modern E2E Testing Framework',
    category: 'E2E Testing',
    content: [
      { type: 'text', value: 'Playwright is the modern standard for E2E testing - fast, reliable, and powerful.' },
      { type: 'bullets', items: [
        'Cross-browser: Chromium, Firefox, WebKit',
        'Auto-wait: No more flaky timeouts',
        'Web-first assertions: expect(locator).toBeVisible()',
        'Trace viewer: Debug failures visually',
        'Parallel execution: Fast test runs',
        'Mobile emulation built-in',
        'API testing included',
      ]},
      { type: 'code', value: `// Install
npm init playwright@latest

// Includes:
// - playwright.config.ts
// - tests/ folder with examples
// - GitHub Actions workflow` },
    ],
  },
  {
    id: 'playwright-example',
    title: 'Playwright Test Example',
    subtitle: 'Testing a Login Flow',
    category: 'E2E Testing',
    content: [
      { type: 'code', value: `// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can log in with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill form
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password123');
    
    // Submit
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Verify success
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });
});` },
    ],
  },
  {
    id: 'playwright-features',
    title: 'Playwright Features',
    subtitle: 'What Makes It Special',
    category: 'E2E Testing',
    content: [
      { type: 'code', value: `// Page Object Model
class LoginPage {
  constructor(private page: Page) {}
  
  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }
}

// API Testing
test('can create user via API', async ({ request }) => {
  const response = await request.post('/api/users', {
    data: { name: 'John', email: 'john@example.com' }
  });
  expect(response.ok()).toBeTruthy();
});

// Visual Comparison
test('homepage looks correct', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});

// Trace Viewer for Debugging
// npx playwright test --trace on
// npx playwright show-trace trace.zip` },
    ],
  },

  // ==================== VISUAL TESTING ====================
  {
    id: 'visual-testing',
    title: 'Visual Regression Testing',
    subtitle: 'Catching UI Changes',
    category: 'Visual Testing',
    content: [
      { type: 'text', value: 'Visual tests compare screenshots to detect unintended UI changes.' },
      { type: 'bullets', items: [
        'Catches CSS regressions that unit tests miss',
        'Verifies layouts across browsers/devices',
        'Great for design system components',
        'Helps review UI changes in PRs',
        'Can catch accessibility issues (contrast, sizing)',
      ]},
      { type: 'comparison',
        left: { title: 'Tools', items: [
          'Playwright screenshots',
          'Percy (by BrowserStack)',
          'Chromatic (by Storybook)',
          'Applitools Eyes',
          'BackstopJS (open source)',
        ]},
        right: { title: 'Challenges', items: [
          'Anti-aliasing differences',
          'Dynamic content (dates, avatars)',
          'Animation timing',
          'Font rendering across OS',
          'Flaky if not deterministic',
        ]}
      },
    ],
  },
  {
    id: 'visual-testing-playwright',
    title: 'Visual Testing with Playwright',
    subtitle: 'Built-in Screenshot Comparisons',
    category: 'Visual Testing',
    content: [
      { type: 'code', value: `// playwright.config.ts
export default defineConfig({
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,      // Allow small differences
      threshold: 0.2,          // Color difference tolerance
    },
  },
});

// tests/visual.spec.ts
test('button states', async ({ page }) => {
  await page.goto('/components/button');
  
  // Full page screenshot
  await expect(page).toHaveScreenshot('button-page.png');
  
  // Component screenshot
  const button = page.getByRole('button', { name: 'Submit' });
  await expect(button).toHaveScreenshot('button-default.png');
  
  // Hover state
  await button.hover();
  await expect(button).toHaveScreenshot('button-hover.png');
  
  // Focus state
  await button.focus();
  await expect(button).toHaveScreenshot('button-focus.png');
});

// Update snapshots: npx playwright test --update-snapshots` },
    ],
  },
  {
    id: 'chromatic',
    title: 'Chromatic',
    subtitle: 'Visual Testing for Storybook',
    category: 'Visual Testing',
    content: [
      { type: 'text', value: 'Chromatic captures snapshots of every Storybook story on every commit.' },
      { type: 'bullets', items: [
        'Automatically tests every component state',
        'Review visual changes in PR workflow',
        'Catches CSS regressions across components',
        'Cross-browser screenshots (Chrome, Firefox, Safari)',
        'Interactive review and approval UI',
        'Integrates with GitHub/GitLab/Bitbucket',
      ]},
      { type: 'code', value: `# Install
npm install --save-dev chromatic

# Run visual tests
npx chromatic --project-token=<your-token>

# In CI (GitHub Actions)
- uses: chromaui/action@latest
  with:
    projectToken: \${{ secrets.CHROMATIC_PROJECT_TOKEN }}` },
    ],
  },

  // ==================== AI & TESTING ====================
  {
    id: 'ai-testing-intro',
    title: 'AI-Assisted Testing',
    subtitle: 'Let AI Write Your Tests',
    category: 'AI & Testing',
    content: [
      { type: 'text', value: 'AI can help generate, improve, and maintain tests - but use it wisely.' },
      { type: 'bullets', items: [
        'Generate test cases from code analysis',
        'Suggest edge cases you might miss',
        'Convert manual test scripts to automated tests',
        'Generate mock data and fixtures',
        'Explain failing tests',
        'Suggest test improvements',
      ]},
      { type: 'comparison',
        left: { title: 'AI Does Well', items: [
          'Boilerplate test structure',
          'Edge case suggestions',
          'Mock data generation',
          'Test file scaffolding',
          'Simple function tests',
        ]},
        right: { title: 'Still Need Humans', items: [
          'Test strategy decisions',
          'Understanding business logic',
          'Complex integration scenarios',
          'Knowing what NOT to test',
          'Reviewing AI output quality',
        ]}
      },
    ],
  },
  {
    id: 'ai-testing-workflow',
    title: 'AI Testing Workflow',
    subtitle: 'Best Practices',
    category: 'AI & Testing',
    content: [
      { type: 'steps', items: [
        { title: 'Describe Intent', description: 'Tell AI what the component does and what you want to test.' },
        { title: 'Generate Draft', description: 'Let AI create the initial test file with common cases.' },
        { title: 'Review & Edit', description: 'Verify tests are meaningful, remove redundant ones.' },
        { title: 'Add Edge Cases', description: 'Ask AI: "What edge cases am I missing?"' },
        { title: 'Run & Iterate', description: 'Fix failing tests, improve assertions, refactor.' },
      ]},
      { type: 'text', value: 'Treat AI-generated tests as a first draft, not the final product.' },
    ],
  },
  {
    id: 'ai-testing-prompts',
    title: 'AI Testing Prompts',
    subtitle: 'Effective Prompting for Tests',
    category: 'AI & Testing',
    content: [
      { type: 'code', value: `// Good Prompt Examples:

"Write tests for this React component using Testing Library.
Focus on user behavior, not implementation details.
The component is a SearchInput that:
- Shows suggestions as user types
- Calls onSelect when a suggestion is clicked
- Shows 'No results' when empty"

"Generate edge case tests for this validation function.
Include: empty input, null, undefined, special characters,
very long strings, SQL injection attempts"

"Convert this Cypress test to Playwright, using 
modern locators (getByRole, getByLabel) instead of 
CSS selectors"

// Bad Prompts:
"Write tests for this code" (too vague)
"Test everything" (no focus)
"Make sure it works" (not actionable)` },
    ],
  },
  {
    id: 'ai-testing-tools',
    title: 'AI Testing Tools',
    subtitle: 'Tools That Use AI for Testing',
    category: 'AI & Testing',
    content: [
      { type: 'bullets', items: [
        'Copilot/Cursor - Generate tests inline as you code',
        'Codium AI - Specialized test generation tool',
        'Mabl - AI-powered E2E test creation and healing',
        'Testim - Self-healing tests with ML',
        'Applitools - AI visual comparisons',
        'Katalon - AI test case generation',
        'ChatGPT/Claude - General test writing assistance',
      ]},
      { type: 'text', value: 'The best approach: Use AI to accelerate, but always review and understand the tests it generates.' },
    ],
  },

  // ==================== MUTATION TESTING ====================
  {
    id: 'mutation-testing-intro',
    title: 'Mutation Testing',
    subtitle: 'Testing Your Tests',
    category: 'Mutation Testing',
    content: [
      { type: 'text', value: 'Mutation testing checks if your tests actually catch bugs by introducing small changes (mutations) to your code.' },
      { type: 'bullets', items: [
        'Makes small changes to your code (mutations)',
        'Runs your tests against each mutation',
        'If tests still pass → mutation "survived" (test weakness)',
        'If tests fail → mutation "killed" (good!)',
        'Higher kill rate = better tests',
      ]},
      { type: 'diagram', value: `
┌─────────────────────────────────────────────────────────┐
│                  Original Code                          │
│   if (age >= 18) return "adult"                        │
└────────────────────────┬────────────────────────────────┘
                         │ Create Mutations
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    if (age > 18)   if (age <= 18)   if (age >= 17)
    Boundary        Negation         Constant
         │               │               │
         ▼               ▼               ▼
    Test Fails? ✓   Test Fails? ✓   Test Fails? ?
    (Killed)        (Killed)        (Survived!)
      ` },
    ],
  },
  {
    id: 'mutation-types',
    title: 'Types of Mutations',
    subtitle: 'Common Mutation Operators',
    category: 'Mutation Testing',
    content: [
      { type: 'bullets', items: [
        'Arithmetic: + → -, * → /, % → *',
        'Relational: > → >=, == → !=, < → <=',
        'Logical: && → ||, ! → (remove)',
        'Conditional: if(x) → if(true), if(false)',
        'Assignment: x = y → x = 0, x = ""',
        'Return: return x → return null',
        'Method calls: obj.method() → (remove call)',
        'String: "hello" → ""',
      ]},
      { type: 'code', value: `// Original
function isAdult(age: number): boolean {
  return age >= 18;
}

// Mutations created:
return age > 18;    // Boundary mutation
return age <= 18;   // Negation mutation  
return age >= 19;   // Constant mutation
return true;        // Return mutation
return false;       // Return mutation` },
    ],
  },
  {
    id: 'stryker',
    title: 'Stryker Mutator',
    subtitle: 'Mutation Testing for JavaScript/TypeScript',
    category: 'Mutation Testing',
    content: [
      { type: 'code', value: `# Install
npm install --save-dev @stryker-mutator/core

# Configure with Vitest
npm install --save-dev @stryker-mutator/vitest-runner

# stryker.config.json
{
  "packageManager": "npm",
  "reporters": ["html", "clear-text", "progress"],
  "testRunner": "vitest",
  "coverageAnalysis": "perTest",
  "mutate": ["src/**/*.ts", "!src/**/*.test.ts"]
}

# Run
npx stryker run

# Output:
# Mutation score: 85%
# Killed: 85, Survived: 15, No Coverage: 3` },
    ],
  },
  {
    id: 'mutation-interpretation',
    title: 'Interpreting Results',
    subtitle: 'What Do Surviving Mutants Mean?',
    category: 'Mutation Testing',
    content: [
      { type: 'comparison',
        left: { title: 'Good Mutation Score (80%+)', items: [
          'Tests catch most bugs',
          'Good assertion coverage',
          'Testing edge cases well',
          'High confidence in tests',
        ]},
        right: { title: 'Low Mutation Score (<60%)', items: [
          'Tests might be superficial',
          'Missing edge case tests',
          'Weak assertions',
          'Tests may pass by accident',
        ]}
      },
      { type: 'text', value: 'Don\'t chase 100% - some mutations are equivalent (same behavior) or in non-critical code.' },
      { type: 'bullets', items: [
        'Focus on surviving mutants in critical business logic',
        'Use to identify weak test areas',
        'Run periodically, not on every commit (slow)',
        'Good for PRs that claim "added tests"',
      ]},
    ],
  },

  // ==================== MODERN PRACTICES ====================
  {
    id: 'contract-testing',
    title: 'Contract Testing',
    subtitle: 'API Compatibility Between Services',
    category: 'Modern Practices',
    content: [
      { type: 'text', value: 'Contract testing verifies that API consumers and providers agree on the API shape.' },
      { type: 'diagram', value: `
┌─────────────────┐                    ┌─────────────────┐
│   Frontend      │    Contract        │   Backend       │
│   (Consumer)    │◄──────────────────►│   (Provider)    │
│                 │                    │                 │
│ Expects:        │   ┌──────────┐     │ Provides:       │
│ - GET /users    │   │ Contract │     │ - GET /users    │
│ - Response:     │   │ { shape }│     │ - Response:     │
│   { id, name }  │   └──────────┘     │   { id, name }  │
└─────────────────┘         │          └─────────────────┘
                            │
                    Verified by Pact
      ` },
      { type: 'bullets', items: [
        'Pact - Most popular contract testing tool',
        'Consumer defines expectations',
        'Provider verifies it meets contract',
        'Catches breaking changes before deployment',
        'Faster than E2E tests across services',
      ]},
    ],
  },
  {
    id: 'accessibility-testing',
    title: 'Accessibility Testing',
    subtitle: 'Testing for All Users',
    category: 'Modern Practices',
    content: [
      { type: 'text', value: 'Automated a11y testing catches many issues, but manual testing is also essential.' },
      { type: 'code', value: `// Jest + jest-axe
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('Button has no a11y violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// Playwright
import AxeBuilder from '@axe-core/playwright';

test('page has no a11y issues', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

// Storybook addon
// .storybook/main.ts
addons: ['@storybook/addon-a11y']` },
    ],
  },
  {
    id: 'property-based-testing',
    title: 'Property-Based Testing',
    subtitle: 'Generate Random Test Inputs',
    category: 'Modern Practices',
    content: [
      { type: 'text', value: 'Instead of specific examples, define properties that should always hold.' },
      { type: 'code', value: `// fast-check library
import fc from 'fast-check';

// Example-based (traditional)
test('sort maintains length', () => {
  expect(sort([3, 1, 2])).toHaveLength(3);
});

// Property-based
test('sort maintains length for any array', () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (arr) => {
      const sorted = sort(arr);
      return sorted.length === arr.length;
    })
  );
});

// Properties to test:
// - Idempotence: f(f(x)) === f(x)
// - Reversibility: decode(encode(x)) === x
// - Invariants: sorted list is always ordered
// - Commutativity: add(a,b) === add(b,a)` },
    ],
  },
  {
    id: 'performance-testing',
    title: 'Performance Testing',
    subtitle: 'Catching Performance Regressions',
    category: 'Modern Practices',
    content: [
      { type: 'bullets', items: [
        'Lighthouse CI - Automated performance audits in CI',
        'Web Vitals testing - LCP, FID, CLS thresholds',
        'Bundle size budgets - Fail if bundle grows too large',
        'React Profiler - Component render performance',
        'Playwright performance - Measure load times in E2E',
      ]},
      { type: 'code', value: `// Lighthouse CI
// lighthouserc.js
module.exports = {
  ci: {
    collect: { url: ['http://localhost:3000'] },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
};

// Bundle size with bundlesize
// package.json
"bundlesize": [
  { "path": "dist/main.js", "maxSize": "100 kB" }
]` },
    ],
  },
  {
    id: 'test-strategy',
    title: 'Building a Test Strategy',
    subtitle: 'Putting It All Together',
    category: 'Modern Practices',
    content: [
      { type: 'steps', items: [
        { title: 'Static Analysis', description: 'TypeScript strict mode, ESLint, Prettier. Free bug prevention.' },
        { title: 'Unit Tests', description: 'Pure functions, utilities, hooks. Fast feedback loop.' },
        { title: 'Component Tests', description: 'Storybook for development, Testing Library for behavior.' },
        { title: 'Integration Tests', description: 'MSW for API mocking. Test user flows with real components.' },
        { title: 'E2E Tests', description: 'Playwright for critical paths: login, checkout, core features.' },
        { title: 'Visual Tests', description: 'Chromatic or Playwright screenshots for UI consistency.' },
        { title: 'Monitoring', description: 'Run periodically: mutation testing, a11y audits, performance.' },
      ]},
    ],
  },

  // ==================== SUMMARY ====================
  {
    id: 'summary',
    title: 'Summary',
    subtitle: 'Key Takeaways',
    category: 'Summary',
    content: [
      { type: 'bullets', items: [
        'Testing Trophy > Testing Pyramid - Focus on integration tests',
        'Test behavior, not implementation',
        'Use the right test type for each scenario',
        'Storybook for component development + testing',
        'Playwright for modern E2E - auto-wait, traces, cross-browser',
        'Visual testing catches CSS regressions',
        'AI assists but doesn\'t replace testing judgment',
        'Mutation testing validates test quality',
        'Combine multiple testing approaches for full coverage',
      ]},
    ],
  },
  {
    id: 'resources',
    title: 'Resources',
    subtitle: 'Learn More',
    category: 'Summary',
    content: [
      { type: 'bullets', items: [
        'Testing Library Docs - testing-library.com',
        'Playwright Docs - playwright.dev',
        'Storybook Docs - storybook.js.org',
        'Kent C. Dodds Blog - kentcdodds.com/blog',
        'Stryker Mutator - stryker-mutator.io',
        'MSW (Mock Service Worker) - mswjs.io',
        'Chromatic - chromatic.com',
        'fast-check - fast-check.dev',
        'Pact - pact.io',
      ]},
      { type: 'text', value: '"The more your tests resemble the way your software is used, the more confidence they can give you." - Testing Library Guiding Principle' },
    ],
  },
];
