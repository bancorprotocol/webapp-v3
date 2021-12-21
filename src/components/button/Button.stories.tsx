import { ComponentStory, ComponentMeta } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import { Button } from './Button';

export default {
  title: 'Components',
  component: Button,
  decorators: [withDesign],
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const ButtonMain = Template.bind({});

ButtonMain.args = {
  children: 'Primary Button',
  variant: 'primary',
  size: 'md',
  outlined: false,
  disabled: false,
  className: '',
};

ButtonMain.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/fwADI9wqDrRAdlMX8EddCw/Bancor-v3?node-id=7879%3A257081',
  },
};
