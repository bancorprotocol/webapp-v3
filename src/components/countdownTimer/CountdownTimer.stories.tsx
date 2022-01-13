import { ComponentStory, ComponentMeta } from '@storybook/react';
import { CountdownTimer } from './CountdownTimer';
import { withDesign } from 'storybook-addon-designs';

export default {
  title: 'Components/CountdownTimer',
  component: CountdownTimer,
  decorators: [withDesign],
} as ComponentMeta<typeof CountdownTimer>;

const Template: ComponentStory<typeof CountdownTimer> = (args) => (
  <CountdownTimer {...args} />
);

export const Countdown = Template.bind({});
Countdown.args = {
  date: 1704349003000,
  msgEnded: 'Countdown Ended',
  interval: 1000,
};

Countdown.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/fwADI9wqDrRAdlMX8EddCw/Bancor-v3?node-id=7879%3A257081',
  },
};
