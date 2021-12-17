import { useDispatch } from 'react-redux';
import {
  rejectNotification,
  removeLiquidityNotification,
  removeLiquidityNotificationFailed,
} from 'services/notifications/notifications';
import { PoolToken } from 'services/observables/tokens';
import { removeLiquidity } from 'services/web3/liquidity/liquidity';

export const PoolTokensCellActions = (poolToken: PoolToken) => {
  const dispatch = useDispatch();

  return (
    <button
      onClick={() =>
        removeLiquidity(
          poolToken,
          (txHash: string) =>
            removeLiquidityNotification(
              dispatch,
              poolToken.amount,
              poolToken.poolName,
              txHash
            ),
          () => {},
          () => rejectNotification(dispatch),
          () =>
            removeLiquidityNotificationFailed(
              dispatch,
              poolToken.amount,
              poolToken.poolName
            )
        )
      }
      className="btn-outline-primary border border-primary dark:border-primary-light h-[30px]"
    >
      Remove Liquidity
    </button>
  );
};
