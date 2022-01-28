import { useDispatch } from 'react-redux';
import { useWeb3React } from '@web3-react/core';
import { openWalletModal } from 'redux/user/user';
import { useApproveModal } from 'hooks/useApproveModal';
import { Pool, Token } from 'services/observables/tokens';
import { addLiquidity } from 'services/web3/liquidity/liquidity';
import {
  addLiquidityFailedNotification,
  addLiquidityNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { prettifyNumber } from 'utils/helperFunctions';
import { useCallback } from 'react';
import { useNavigation } from 'services/router';
import {
  ConversionEvents,
  sendLiquidityApprovedEvent,
  sendLiquidityEvent,
  sendLiquidityFailEvent,
  sendLiquiditySuccessEvent,
  setCurrentLiquidity,
} from '../../../../../services/api/googleTagManager';
import { useAppSelector } from '../../../../../redux';

interface Props {
  pool: Pool;
  bnt: Token;
  tkn: Token;
  amountBnt: string;
  amountTkn: string;
  errorMsg?: string;
}

export const AddLiquidityEmptyCTA = ({
  pool,
  bnt,
  tkn,
  amountBnt,
  amountTkn,
  errorMsg,
}: Props) => {
  const dispatch = useDispatch();
  const { account, chainId } = useWeb3React();
  const { pushPortfolio } = useNavigation();
  const fiatToggle = useAppSelector<boolean>((state) => state.user.usdToggle);

  const handleAddLiquidity = useCallback(async () => {
    const cleanTkn = prettifyNumber(amountTkn);
    const cleanBnt = prettifyNumber(amountBnt);
    let transactionId: string;
    await addLiquidity(
      amountBnt,
      bnt,
      amountTkn,
      tkn,
      pool.converter_dlt_id,
      (txHash: string) => {
        transactionId = txHash;
        addLiquidityNotification(
          dispatch,
          txHash,
          cleanTkn,
          tkn.symbol,
          cleanBnt,
          bnt.symbol,
          pool.name
        );
      },
      () => {
        sendLiquiditySuccessEvent(transactionId);
        if (window.location.pathname.includes(pool.pool_dlt_id))
          pushPortfolio();
      },
      () => {
        sendLiquidityFailEvent('User rejected transaction');
        rejectNotification(dispatch);
      },
      (errorMsg) => {
        sendLiquidityFailEvent(errorMsg);
        addLiquidityFailedNotification(
          dispatch,
          cleanTkn,
          tkn.symbol,
          cleanBnt,
          bnt.symbol,
          pool.name
        );
      }
    );
  }, [amountTkn, tkn, amountBnt, bnt, pool, pushPortfolio, dispatch]);

  const [onStart, ModalApprove] = useApproveModal(
    [
      { amount: amountBnt, token: bnt },
      { amount: amountTkn, token: tkn },
    ],
    handleAddLiquidity,
    pool.converter_dlt_id,
    sendLiquidityEvent,
    sendLiquidityApprovedEvent
  );

  const button = () => {
    if (errorMsg) {
      return { label: errorMsg, disabled: true, variant: 'btn-error' };
    }
    if (!amountBnt || !amountTkn) {
      return {
        label: 'Enter amount',
        disabled: true,
        variant: 'btn-primary',
      };
    } else {
      return { label: 'Supply', disabled: false, variant: 'btn-primary' };
    }
  };

  const onClick = () => {
    if (!account) {
      dispatch(openWalletModal(true));
    } else {
      const tknAmountUsd = Number(amountTkn) * Number(tkn.usdPrice ?? 0);
      const bntAmountUsd = Number(amountBnt) * Number(bnt.usdPrice ?? 0);
      setCurrentLiquidity(
        'Deposit Dual',
        chainId,
        pool.name,
        tkn.symbol,
        amountTkn,
        tknAmountUsd.toString(),
        amountBnt,
        bntAmountUsd,
        fiatToggle
      );
      sendLiquidityEvent(ConversionEvents.click);
      onStart();
    }
  };

  return (
    <>
      <button
        onClick={() => onClick()}
        disabled={button().disabled}
        className={`${button().variant} rounded w-full mt-20`}
      >
        {button().label}
      </button>
      {ModalApprove}
    </>
  );
};
