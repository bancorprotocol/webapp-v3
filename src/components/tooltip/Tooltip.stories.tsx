import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { withDesign } from 'storybook-addon-designs';

export default {
  title: 'Components/Tooltip',
  component: Tooltip,
  decorators: [withDesign],
} as ComponentMeta<typeof Tooltip>;

const Template: ComponentStory<typeof Tooltip> = (args) => (
  <Tooltip {...args} />
);

export const Countdown = Template.bind({});
Countdown.args = {
  content: 'This is a tooltip',
};

Countdown.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/fwADI9wqDrRAdlMX8EddCw/Bancor-v3?node-id=7879%3A257081',
  },
};
