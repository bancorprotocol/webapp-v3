import { Pool } from 'services/observables/tokens';
import {
  stakePoolLevelRewards,
  stakeRewards,
} from 'services/web3/protection/rewards';
import { useState } from 'react';
import {
  stakeRewardsFailedNotification,
  stakeRewardsNotification,
} from 'services/notifications/notifications';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { prettifyNumber } from 'utils/helperFunctions';
import { ProtectedPositionGrouped } from 'services/web3/protection/positions';

interface Props {
  pool: Pool;
  account?: string | null;
  errorBalance: string;
  bntAmount: string;
  position?: ProtectedPositionGrouped;
}

export const RewardsStakeCTA = ({
  pool,
  account,
  errorBalance,
  bntAmount,
  position,
}: Props) => {
  const [isBusy, setIsBusy] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();

  const handleClick = async () => {
    try {
      setIsBusy(true);
      let txHash = '';
      if (position) {
        txHash = await stakePoolLevelRewards({
          newPoolId: pool.pool_dlt_id,
          reserveId: position.reserveToken.address,
          amount: bntAmount,
          poolId: position.pool.pool_dlt_id,
        });
      } else {
        txHash = await stakeRewards({
          amount: bntAmount,
          poolId: pool.pool_dlt_id,
        });
      }
      stakeRewardsNotification(
        dispatch,
        txHash,
        prettifyNumber(bntAmount),
        pool.name
      );
      history.push('/portfolio');
    } catch (e) {
      console.error('Staking Rewards failed with msg: ', e.message);
      stakeRewardsFailedNotification(dispatch);
    } finally {
      setIsBusy(false);
    }
  };

  const btnOptions = () => {
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

  const btn = btnOptions();

  return (
    <button
      onClick={() => handleClick()}
      disabled={btn.disabled}
      className={`${btn.variant} rounded w-full mt-10`}
    >
      {btn.label}
    </button>
  );
};
