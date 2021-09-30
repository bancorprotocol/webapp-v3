import { useDispatch } from 'react-redux';
import { useWeb3React } from '@web3-react/core';
import { openWalletModal } from 'redux/user/user';
import { useApproveModal } from 'hooks/useApproveModal';
import { Pool, Token } from 'services/observables/tokens';
import { addLiquidity } from 'services/web3/contracts/converter/wrapper';

interface Props {
  pool: Pool;
  bnt: Token;
  tkn: Token;
  amountBnt: string;
  amountTkn: string;
}

export const AddLiquidityEmptyCTA = ({
  pool,
  bnt,
  tkn,
  amountBnt,
  amountTkn,
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
    } catch (e) {
      console.error('Add liquidity failed with msg: ', e.message);
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
    if (!amountBnt || !amountTkn) {
      return { label: 'Enter amount', disabled: true };
    } else {
      return { label: 'Supply', disabled: false };
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
        className="btn-primary rounded w-full mt-20"
      >
        {button().label}
      </button>
      {ModalApprove}
    </>
  );
};
