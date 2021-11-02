import { useDispatch } from 'react-redux';
import { rejectNotification } from 'services/notifications/notifications';
import { PoolToken } from 'services/observables/tokens';
import { removeLiquidity } from 'services/web3/liquidity/liquidity';

export const PoolTokensCellActions = (poolToken: PoolToken) => {
  const dispatch = useDispatch();

  return (
    <button
      onClick={() =>
        removeLiquidity(
          poolToken,
          () => {},
          () => {},
          () => rejectNotification(dispatch),
          () => {}
        )
      }
      className="btn-outline-primary border border-primary dark:border-primary-light h-[30px]"
    >
      Remove Liquidity
    </button>
  );
};
