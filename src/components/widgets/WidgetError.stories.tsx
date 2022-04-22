import { ComponentMeta, ComponentStory } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import { WidgetError } from './WidgetError';

export default {
  title: 'Components/Widgets',
  component: WidgetError,
  decorators: [withDesign],
} as ComponentMeta<typeof WidgetError>;

const Template: ComponentStory<typeof WidgetError> = (args) => (
  <WidgetError {...args} />
);

export const Error = Template.bind({});

Error.args = {
  title: 'Widget Error',
};

Error.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/fwADI9wqDrRAdlMX8EddCw/Bancor-v3?node-id=7879%3A257081',
  },
};
