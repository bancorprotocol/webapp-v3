import { useWeb3React } from '@web3-react/core';
import { openWalletModal } from 'redux/user/user';
import { useDispatch } from 'react-redux';

interface Props {
  onStart: Function;
  amount: string;
}

export const AddLiquiditySingleCTA = ({ onStart, amount }: Props) => {
  const dispatch = useDispatch();
  const { account } = useWeb3React();

  const button = () => {
    if (!amount) {
      return { label: 'Enter amount', disabled: true };
    } else {
      return { label: 'Stake and Protect', disabled: false };
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
    <button
      onClick={() => onClick()}
      disabled={button().disabled}
      className="btn-primary rounded w-full"
    >
      {button().label}
    </button>
  );
};
