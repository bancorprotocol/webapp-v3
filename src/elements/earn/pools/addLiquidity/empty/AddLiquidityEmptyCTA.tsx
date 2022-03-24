import { useDispatch } from 'react-redux';
import { openWalletModal } from 'redux/user/user';
import { useApproveModal } from 'hooks/useApproveModal';
import { Token } from 'services/observables/tokens';
import { addLiquidity } from 'services/web3/liquidity/liquidity';
import {
  addLiquidityFailedNotification,
  addLiquidityNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { prettifyNumber } from 'utils/helperFunctions';
import { useCallback } from 'react';
import { useNavigation } from 'services/router';
import { Button, ButtonVariant } from 'components/button/Button';
import { useAppSelector } from 'redux/index';
import { Pool } from 'services/observables/v3/pools';

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
  const account = useAppSelector<string | undefined>(
    (state) => state.user.account
  );
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
      return { label: errorMsg, disabled: true, variant: ButtonVariant.ERROR };
    }
    if (!amountBnt || !amountTkn) {
      return {
        label: 'Enter amount',
        disabled: true,
        variant: ButtonVariant.PRIMARY,
      };
    } else {
      return {
        label: 'Supply',
        disabled: false,
        variant: ButtonVariant.PRIMARY,
      };
    }
  };

  const btn = button();

  const onClick = () => {
    if (!account) {
      dispatch(openWalletModal(true));
    } else {
      onStart();
    }
  };

  return (
    <>
      <Button
        onClick={() => onClick()}
        variant={btn.variant}
        disabled={btn.disabled}
        className={`w-full mt-20`}
      >
        {btn.label}
      </Button>
      {ModalApprove}
    </>
  );
};
