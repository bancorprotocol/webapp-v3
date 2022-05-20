import { ComponentStory, ComponentMeta } from '@storybook/react';
import { PopoverV3 } from 'components/popover/PopoverV3';

export default {
  title: 'Components/PopoverV3',
  component: PopoverV3,
} as ComponentMeta<typeof PopoverV3>;

const Template: ComponentStory<typeof PopoverV3> = (args) => (
  <PopoverV3 {...args} />
);

export const Popover = Template.bind({});

Popover.args = {
  children: <div>'Hello there'</div>,
  buttonElement: ({ isOpen, setIsOpen }) => (
    <button onClick={() => setIsOpen(!isOpen)}>Info</button>
  ),
  showArrow: false,
  hover: true,
  options: {
    placement: 'bottom',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 10],
        },
      },
    ],
  },
};
