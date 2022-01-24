import { useDispatch } from 'react-redux';
import {
  rejectNotification,
  removeLiquidityNotification,
  removeLiquidityNotificationFailed,
} from 'services/notifications/notifications';
import { PoolToken } from 'services/observables/tokens';
import { removeLiquidity } from 'services/web3/liquidity/liquidity';
import {
  ConversionEvents,
  sendLiquidityEvent,
  sendLiquidityFailEvent,
  sendLiquiditySuccessEvent,
  setCurrentLiquidity,
} from '../../../../../services/api/googleTagManager';
import { useWeb3React } from '@web3-react/core';

export const PoolTokensCellActions = (poolToken: PoolToken) => {
  const dispatch = useDispatch();
  const { chainId } = useWeb3React();

  const handleClick = () => {
    setCurrentLiquidity(
      'Withdraw Dual',
      chainId,
      poolToken.poolName,
      poolToken.poolName,
      poolToken.amount,
      undefined,
      undefined,
      undefined,
      undefined
    );
    sendLiquidityEvent(ConversionEvents.click);
    let transactionId: string;
    removeLiquidity(
      poolToken,
      (txHash: string) => {
        transactionId = txHash;
        removeLiquidityNotification(
          dispatch,
          poolToken.amount,
          poolToken.poolName,
          txHash
        );
      },
      () => {
        sendLiquiditySuccessEvent(transactionId);
      },
      () => {
        sendLiquidityFailEvent('User rejected transaction');
        rejectNotification(dispatch);
      },
      (errorMsg) => {
        sendLiquidityFailEvent(errorMsg);
        removeLiquidityNotificationFailed(
          dispatch,
          poolToken.amount,
          poolToken.poolName
        );
      }
    );
  };

  return (
    <button
      onClick={() => handleClick()}
      className="btn-outline-primary border border-primary dark:border-primary-light h-[30px]"
    >
      Remove Liquidity
    </button>
  );
};
