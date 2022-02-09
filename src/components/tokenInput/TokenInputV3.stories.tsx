import { ComponentMeta, ComponentStory } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import TokenInputV3 from 'components/tokenInput/TokenInputV3';
import { useState } from 'react';

export default {
  title: 'Components/TokenInput',
  component: TokenInputV3,
  decorators: [withDesign],
} as ComponentMeta<typeof TokenInputV3>;

export const TokenInput: ComponentStory<typeof TokenInputV3> = (args) => {
  const [amount, setAmount] = useState('');

  return <TokenInputV3 {...args} amount={amount} setAmount={setAmount} />;
};

TokenInput.args = {
  isFiat: false,
  amount: '',
  usdPrice: '2',
};

TokenInput.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/37rEn9Up8BK377t7KFQZ91/Bancor-Design-System?node-id=338%3A32981',
  },
};
