import { ComponentMeta, ComponentStory } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import { Rating } from './Rating';

export default {
  title: 'Components/Rating',
  component: Rating,
  decorators: [withDesign],
  argTypes: {
    percentage: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
} as ComponentMeta<typeof Rating>;

export const StarRating: ComponentStory<typeof Rating> = (args) => (
  <Rating {...args} />
);

StarRating.args = {
  percentage: 50,
  starCount: 5,
  showEmpty: true,
  fillEmpty: false,
  strokeWidth: 0.5,
  classStar: 'text-warning',
  classEmpty: 'text-grey',
  className: '',
};

StarRating.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/37rEn9Up8BK377t7KFQZ91/Bancor-Design-System?node-id=103%3A1425',
  },
};
