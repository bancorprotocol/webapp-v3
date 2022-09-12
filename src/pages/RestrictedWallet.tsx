import { DisabledWarning } from 'components/disabledWarning/DisabledWarning';

const title = 'Wallet blocked';
const description =
  'For compliance reasons, this wallet has been blocked from using the bancor.network app.';

export const RestrictedWallet = () => {
  return <DisabledWarning title={title} description={description} />;
};
