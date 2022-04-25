import { ComponentStory, ComponentMeta } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import { Widget } from './Widget';
import { store } from 'store';
import { Provider } from 'react-redux';

export default {
  title: 'Components/Widgets',
  component: Widget,
  decorators: [withDesign],
} as ComponentMeta<typeof Widget>;

const Template: ComponentStory<typeof Widget> = (args) => (
  <Provider store={store}>
    <Widget {...args} />
  </Provider>
);

export const Main = Template.bind({});

Main.args = {
  title: 'Widget',
  subtitle: 'Widget subtitle',
  children: <div>Hello World</div>,
};

Main.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/fwADI9wqDrRAdlMX8EddCw/Bancor-v3?node-id=7879%3A257081',
  },
};
