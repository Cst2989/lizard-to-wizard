// Button Stories - TASK
// Complete these stories to document the Button component!
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button-Task',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // TODO: Add argTypes to enable controls for:
  // - variant (select with options: primary, secondary, danger)
  // - size (select with options: small, medium, large)
  // - loading (boolean)
  // - disabled (boolean)
  // - fullWidth (boolean)
};

export default meta;
type Story = StoryObj<typeof Button>;

// TODO: Create a Primary story
// Hint: export const Primary: Story = { args: { children: '...', variant: '...' } }
export const Primary: Story = {
  args: {
    children: 'TODO: Add text',
  },
};

// TODO: Create a Secondary story

// TODO: Create a Danger story

// TODO: Create a Loading story with loading: true

// TODO: Create a Disabled story with disabled: true

// TODO: Create an interactive test story
// This story should:
// 1. Click the button
// 2. Verify something happened
// Hint: Use the 'play' function
export const ClickTest: Story = {
  args: {
    children: 'Click me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // TODO: Verify button is enabled
    // Hint: await expect(button).toBeEnabled()

    // TODO: Click the button
    // Hint: await userEvent.click(button)

    // TODO: Add an assertion after click
  },
};

// TODO: Create a keyboard navigation test story
// This story should:
// 1. Tab to focus the button
// 2. Verify it has focus
// 3. Verify it has an accessible name
export const KeyboardNavigation: Story = {
  args: {
    children: 'Keyboard Test',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // TODO: Use userEvent.tab() to focus
    
    // TODO: Verify button has focus
    // Hint: await expect(button).toHaveFocus()
    
    // TODO: Verify accessible name
    // Hint: await expect(button).toHaveAccessibleName('Keyboard Test')
  },
};

// TODO: Create a story that shows all variants together
// Hint: Use the 'render' function to return multiple buttons
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      {/* TODO: Add buttons for each variant */}
      <Button>TODO</Button>
    </div>
  ),
};
