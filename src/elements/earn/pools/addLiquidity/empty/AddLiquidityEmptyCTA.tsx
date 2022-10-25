import { useDispatch } from 'react-redux';
import { Token } from 'services/observables/tokens';
import { addLiquidity } from 'services/web3/liquidity/liquidity';
import {
  addLiquidityFailedNotification,
  addLiquidityNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { prettifyNumber } from 'utils/helperFunctions';
import { useCallback } from 'react';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { useAppSelector } from 'store';
import { Pool } from 'services/observables/pools';
import { useNavigation } from 'hooks/useNavigation';
import { useWalletConnect } from 'elements/walletConnect/useWalletConnect';
import { useApproval } from 'hooks/useApproval';

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
  const account = useAppSelector((state) => state.user.account);
  const { handleWalletButtonClick } = useWalletConnect();
  const { goToPage } = useNavigation();

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
          goToPage.portfolioV2();
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
  }, [
    amountTkn,
    amountBnt,
    bnt,
    tkn,
    pool.converter_dlt_id,
    pool.name,
    pool.pool_dlt_id,
    dispatch,
    goToPage,
  ]);

  const startApprove = useApproval(
    [
      { amount: amountBnt, token: bnt },
      { amount: amountTkn, token: tkn },
    ],
    handleAddLiquidity,
    pool.converter_dlt_id
  );

  const button = () => {
    if (errorMsg) {
      return {
        label: errorMsg,
        disabled: true,
        variant: ButtonVariant.Secondary,
      };
    }
    if (!amountBnt || !amountTkn) {
      return {
        label: 'Enter amount',
        disabled: true,
        variant: ButtonVariant.Primary,
      };
    } else {
      return {
        label: 'Supply',
        disabled: false,
        variant: ButtonVariant.Primary,
      };
    }
  };

  const btn = button();

  const onClick = () => {
    if (!account) {
      handleWalletButtonClick();
    } else {
      startApprove();
    }
  };

  return (
    <>
      <Button
        onClick={() => onClick()}
        variant={btn.variant}
        disabled={btn.disabled}
        size={ButtonSize.Full}
        className="mt-20 disabled:bg-silver dark:disabled:bg-charcoal"
      >
        {btn.label}
      </Button>
    </>
  );
};
