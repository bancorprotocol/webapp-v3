import { useDispatch } from 'react-redux';
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
import BigNumber from 'bignumber.js';
import { useWeb3React } from '@web3-react/core';

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
  const { chainId } = useWeb3React();
  const account = useAppSelector<string | undefined>(
    (state) => state.user.account
  );
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
      const tknAmountUsd = new BigNumber(amountTkn)
        .times(tkn.usdPrice ?? 0)
        .toString();
      const bntAmountUsd = new BigNumber(amountBnt)
        .times(bnt.usdPrice ?? 0)
        .toString();
      setCurrentLiquidity(
        'Deposit Dual',
        chainId,
        pool.name,
        tkn.symbol,
        amountTkn,
        tknAmountUsd,
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
