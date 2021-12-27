import { Pool } from 'services/observables/tokens';
import {
  stakePoolLevelRewards,
  stakeRewards,
} from 'services/web3/protection/rewards';
import { useCallback, useState } from 'react';
import {
  rejectNotification,
  stakeRewardsFailedNotification,
  stakeRewardsNotification,
} from 'services/notifications/notifications';
import { useDispatch } from 'react-redux';

import { prettifyNumber } from 'utils/helperFunctions';
import {
  fetchProtectedPositions,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';
import {
  setLoadingPositions,
  setProtectedPositions,
} from 'redux/liquidity/liquidity';
import { useAppSelector } from 'redux/index';
import { useNavigation } from 'services/router';

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
  const { pushPortfolio } = useNavigation();
  const pools = useAppSelector<Pool[]>((state) => state.pool.pools);

  const onCompleted = useCallback(async () => {
    dispatch(setLoadingPositions(true));
    const positions = await fetchProtectedPositions(pools, account!);
    dispatch(setProtectedPositions(positions));
    dispatch(setLoadingPositions(false));
  }, [account, dispatch, pools]);

  const onHash = useCallback(
    (txHash: string) => {
      stakeRewardsNotification(
        dispatch,
        txHash,
        prettifyNumber(bntAmount),
        pool.name
      );
      pushPortfolio();
    },
    [bntAmount, dispatch, pushPortfolio, pool.name]
  );

  const handleClick = async () => {
    try {
      setIsBusy(true);
      if (position) {
        await stakePoolLevelRewards({
          newPoolId: pool.pool_dlt_id,
          reserveId: position.reserveToken.address,
          amount: bntAmount,
          poolId: position.pool.pool_dlt_id,
          onHash: (txHash) => onHash(txHash),
          onCompleted: () => onCompleted(),
          rejected: () => rejectNotification(dispatch),
          failed: () => stakeRewardsFailedNotification(dispatch),
        });
      } else {
        await stakeRewards({
          amount: bntAmount,
          poolId: pool.pool_dlt_id,
          onHash: (txHash) => onHash(txHash),
          onCompleted: () => onCompleted(),
          rejected: () => rejectNotification(dispatch),
          failed: () => stakeRewardsFailedNotification(dispatch),
        });
      }
    } catch (e: any) {
      console.error('Staking Rewards failed with msg: ', e.message);
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
