import { DisabledWarning } from 'components/disabledWarning/DisabledWarning';

const title = 'Wallet blocked';
const description =
  'This wallet has been tagged as being engaged in prohibited use. We regret to inform you that you can no longer use the Bancor app.';
const buttonHref =
  'https://home.treasury.gov/policy-issues/financial-sanctions/recent-actions/20220808';

export const RestrictedWallet = () => {
  return (
    <DisabledWarning
      title={title}
      description={description}
      buttonHref={buttonHref}
    />
  );
};
