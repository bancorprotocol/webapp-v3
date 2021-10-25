import { useDispatch } from 'react-redux';
import { useWeb3React } from '@web3-react/core';
import { openWalletModal } from 'redux/user/user';
import { useApproveModal } from 'hooks/useApproveModal';
import { Pool, Token } from 'services/observables/tokens';
import {
  addNotification,
  NotificationType,
} from 'redux/notification/notification';
import { prettifyNumber } from 'utils/helperFunctions';
import { ErrorCode } from 'services/web3/types';
import { addLiquidity } from 'services/web3/liquidity/liquidity';

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

  const handleAddLiquidity = async () => {
    try {
      const data = [
        { amount: amountBnt, token: bnt },
        { amount: amountTkn, token: tkn },
      ];
      const txHash = await addLiquidity(data, pool.converter_dlt_id);
      dispatch(
        addNotification({
          type: NotificationType.pending,
          title: 'Add Liquidity',
          msg: `You added ${prettifyNumber(amountTkn)} ${
            tkn.symbol
          } and ${prettifyNumber(amountBnt)} ${bnt.symbol} to pool ${
            pool.name
          }`,
          txHash,
        })
      );
    } catch (e) {
      console.error('Add liquidity failed with msg: ', e.message);
      if (e.code === ErrorCode.DeniedTx) {
        dispatch(
          addNotification({
            type: NotificationType.error,
            title: 'Transaction Rejected',
            msg: 'You rejected the transaction. If this was by mistake, please try again.',
          })
        );
      } else {
        dispatch(
          addNotification({
            type: NotificationType.error,
            title: 'Transaction Failed',
            msg: `Adding liquidity to pool ${pool.name} failed. Please try again or contact support.`,
          })
        );
      }
    }
  };

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
