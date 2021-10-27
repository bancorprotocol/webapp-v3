import { Pool } from 'services/observables/tokens';
import { stakeRewards } from 'services/web3/protection/rewards';
import { useState } from 'react';

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
  const [isBusy, setIsBusy] = useState(false);

  const handleClick = async () => {
    try {
      setIsBusy(true);
      const txHash = await stakeRewards({
        amount: bntAmount,
        poolId: pool.pool_dlt_id,
      });
    } catch (e) {
      console.error('Staking Rewards failed with msg: ', e.message);
    } finally {
      setIsBusy(false);
    }
  };

  const button = () => {
    if (!account) {
      return { label: 'Login', disabled: false, variant: 'btn-primary' };
    } else if (isBusy) {
      return {
        label: 'Please wait ...',
        disabled: true,
        variant: 'btn-primary',
      };
    } else if (errorBalance) {
      return { label: errorBalance, disabled: true, variant: 'btn-error' };
    } else if (!bntAmount) {
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
      onClick={() => handleClick()}
      disabled={button().disabled}
      className={`${button().variant} rounded w-full mt-10`}
    >
      {button().label}
    </button>
  );
};
