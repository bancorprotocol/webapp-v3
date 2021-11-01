import { useDispatch } from 'react-redux';
import { rejectNotification } from 'services/notifications/notifications';
import { removeLiquidity } from 'services/web3/liquidity/liquidity';

export const PoolTokensCellActions = (
  converter: string,
  amount: string,
  poolDecimals: number,
  reserves: string[]
) => {
  const dispatch = useDispatch();

  return (
    <button
      onClick={() =>
        removeLiquidity(
          converter,
          amount,
          poolDecimals,
          reserves,
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
