import { fn } from '@storybook/test';
import { Button } from './Button';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'Example/Button',
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary = {
  args: {
    type: 'Primary',
    label: 'Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'For the principal action on the page. It’s recommended that primary buttons only appear once per screen (not including modals or dialogs).',
      },
    },
  },
};

export const Secondary = {
  args: {
    type: 'Secondary',
    label: 'Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'For secondary actions on each page. Secondary buttons are recommended to be used in conjunction with a primary button.',
      },
    },
  },
};

export const Tertiary = {
  args: {
    type: 'Tertiary',
    label: 'Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'For actions that are less important. Eg: Edit, Back, Cancel',
      },
    },
  },
};

export const Ghost = {
  args: {
    type: 'Ghost',
    label: 'Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Ghost buttons can also accompany Primary and Secondary buttons for actions. The difference between ghost and link is the padding and the the states',
      },
    },
  },
};

export const Danger = {
  args: {
    type: 'Danger',
    label: 'Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'For actions that have destructive effects on the user’s data: Eg: Delete, Remove, Cancel and lose important information',
      },
    },
  },
};



export const Disabled = {
  args: {
    size: 'large',
    label: 'Button',
    disabled: true,
  },
};

export const IconRight = {
  args: {
    size: 'large',
    label: 'Button',
    iconPosition: 'right',
  },
};
