import { DisabledWarning } from 'components/disabledWarning/DisabledWarning';

const title = 'Unsupported network';
const description =
  'In order to proceed, please change your wallets network settings to Ethereum Mainnet.';

export const UnsupportedNetwork = () => {
  return <DisabledWarning title={title} description={description} />;
};
