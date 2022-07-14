import { ComponentMeta, ComponentStory } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import { useState } from 'react';
import V3WithdrawModal from 'modals/V3WithdrawModal';
import { store } from 'store';
import { Provider } from 'react-redux';

export default {
  title: 'Elements/V3/Portfolio/EarningsTable',
  component: V3WithdrawModal,
  decorators: [withDesign],
} as ComponentMeta<typeof V3WithdrawModal>;

export const WithdrawModal: ComponentStory<typeof V3WithdrawModal> = (args) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Provider store={store}>
      <V3WithdrawModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
    </Provider>
  );
};

WithdrawModal.args = {
  isOpen: true,
};

WithdrawModal.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/37rEn9Up8BK377t7KFQZ91/Bancor-Design-System?node-id=338%3A32981',
  },
};
