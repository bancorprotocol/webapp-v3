import { ComponentMeta, ComponentStory } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import { store } from 'store';
import { Provider } from 'react-redux';
import { V3BonusesModal } from 'elements/earn/portfolio/v3/bonuses/V3BonusesModal';

export default {
  title: 'Elements/V3/Portfolio/Bonuses',
  component: V3BonusesModal,
  decorators: [withDesign],
} as ComponentMeta<typeof V3BonusesModal>;

export const BonusesModal: ComponentStory<typeof V3BonusesModal> = () => {
  return (
    <Provider store={store}>
      <V3BonusesModal />
    </Provider>
  );
};

BonusesModal.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/37rEn9Up8BK377t7KFQZ91/Bancor-Design-System?node-id=338%3A32981',
  },
};
