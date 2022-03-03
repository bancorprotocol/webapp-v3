import { ComponentMeta, ComponentStory } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import { ProgressBar } from 'components/progressBar/ProgressBar';

export default {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  decorators: [withDesign],
  argTypes: {
    percentage: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
} as ComponentMeta<typeof ProgressBar>;

export const Progress: ComponentStory<typeof ProgressBar> = (args) => {
  return <ProgressBar {...args} />;
};

Progress.args = {
  percentage: 50,
  showPercentage: true,
};

Progress.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/37rEn9Up8BK377t7KFQZ91/Bancor-Design-System?node-id=338%3A32981',
  },
};
