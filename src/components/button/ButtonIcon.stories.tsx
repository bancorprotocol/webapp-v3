import { ComponentMeta, ComponentStory } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import { ButtonIcon } from './ButtonIcon';
import { ReactComponent as IconSync } from 'assets/icons/sync.svg';

export default {
  title: 'Components/Buttons',
  component: ButtonIcon,
  decorators: [withDesign],
} as ComponentMeta<typeof ButtonIcon>;

export const Icons: ComponentStory<typeof ButtonIcon> = (args) => {
  return <ButtonIcon {...args} />;
};

Icons.args = {
  children: <IconSync />,
  animate: true,
};

Icons.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/37rEn9Up8BK377t7KFQZ91/Bancor-Design-System?node-id=338%3A32981',
  },
};
