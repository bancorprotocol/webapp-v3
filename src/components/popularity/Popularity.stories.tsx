import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Popularity } from './Popularity';
import { withDesign } from 'storybook-addon-designs';

export default {
  title: 'Components/Popularity',
  component: Popularity,
  decorators: [withDesign],
} as ComponentMeta<typeof Popularity>;

const Template: ComponentStory<typeof Popularity> = (args) => (
  <Popularity {...args} />
);

export const Countdown = Template.bind({});
Countdown.args = {
  stars: 4,
};

Countdown.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/fwADI9wqDrRAdlMX8EddCw/Bancor-v3?node-id=9725%3A296261',
  },
};
