import { useDispatch } from 'react-redux';
import {
  rejectNotification,
  removeLiquidityNotification,
  removeLiquidityNotificationFailed,
} from 'services/notifications/notifications';
import { removeLiquidity } from 'services/web3/liquidity/liquidity';
import {
  ConversionEvents,
  sendLiquidityEvent,
  sendLiquidityFailEvent,
  sendLiquiditySuccessEvent,
  setCurrentLiquidity,
} from 'services/api/googleTagManager';
import { useWeb3React } from '@web3-react/core';
import { PoolToken } from 'services/observables/pools';
import { Button } from 'components/button/Button';

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
    <Button onClick={() => handleClick()} className="h-[30px]">
      Remove Liquidity
    </Button>
  );
};
