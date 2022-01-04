import { ComponentStory, ComponentMeta } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import { Sidebar } from './Sidebar';
import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../../redux';
import { Provider } from 'react-redux';

export default {
  title: 'Layout/Sidebar',
  component: Sidebar,
  decorators: [withDesign],
} as ComponentMeta<typeof Sidebar>;

export const Menu: ComponentStory<typeof Sidebar> = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  return (
    <BrowserRouter>
      <Provider store={store}>
        <Sidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
      </Provider>
    </BrowserRouter>
  );
};

Menu.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/fwADI9wqDrRAdlMX8EddCw/Bancor-v3?node-id=7879%3A257081',
  },
};
