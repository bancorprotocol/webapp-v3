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
  const { account } = useWeb3React();
  const { pushPortfolio } = useNavigation();

  const handleAddLiquidity = useCallback(async () => {
    const cleanTkn = prettifyNumber(amountTkn);
    const cleanBnt = prettifyNumber(amountBnt);
    await addLiquidity(
      amountBnt,
      bnt,
      amountTkn,
      tkn,
      pool.converter_dlt_id,
      (txHash: string) =>
        addLiquidityNotification(
          dispatch,
          txHash,
          cleanTkn,
          tkn.symbol,
          cleanBnt,
          bnt.symbol,
          pool.name
        ),
      () => {
        if (window.location.pathname.includes(pool.pool_dlt_id))
          pushPortfolio();
      },
      () => rejectNotification(dispatch),
      () =>
        addLiquidityFailedNotification(
          dispatch,
          cleanTkn,
          tkn.symbol,
          cleanBnt,
          bnt.symbol,
          pool.name
        )
    );
  }, [amountTkn, tkn, amountBnt, bnt, pool, pushPortfolio, dispatch]);

  const [onStart, ModalApprove] = useApproveModal(
    [
      { amount: amountBnt, token: bnt },
      { amount: amountTkn, token: tkn },
    ],
    handleAddLiquidity,
    pool.converter_dlt_id
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
