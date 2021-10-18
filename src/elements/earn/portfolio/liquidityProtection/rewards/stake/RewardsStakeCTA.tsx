import { Pool } from 'services/observables/tokens';

interface Props {
  pool: Pool;
  account?: string | null;
  errorBalance: string;
  bntAmount: string;
}

export const RewardsStakeCTA = ({
  pool,
  account,
  errorBalance,
  bntAmount,
}: Props) => {
  const button = () => {
    if (errorBalance) {
      return { label: errorBalance, disabled: true, variant: 'btn-error' };
    }
    if (!bntAmount) {
      return {
        label: 'Enter amount',
        disabled: true,
        variant: 'btn-primary',
      };
    } else {
      return {
        label: 'Stake and Protect',
        disabled: false,
        variant: 'btn-primary',
      };
    }
  };
  return (
    <button
      disabled={button().disabled}
      className={`${button().variant} rounded w-full mt-10`}
    >
      {button().label}
    </button>
  );
};
