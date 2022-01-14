import { useWeb3React } from '@web3-react/core';
import { openWalletModal } from 'redux/user/user';
import { useDispatch } from 'react-redux';
import { Button, ButtonVariant } from 'components/button/Button';

interface Props {
  onStart: Function;
  amount: string;
  errorMsg: string;
}

export const AddLiquiditySingleCTA = ({ onStart, amount, errorMsg }: Props) => {
  const dispatch = useDispatch();
  const { account } = useWeb3React();

  const button = () => {
    if (errorMsg) {
      return { label: errorMsg, disabled: true, variant: ButtonVariant.ERROR };
    }
    if (!amount) {
      return {
        label: 'Enter amount',
        disabled: true,
        variant: ButtonVariant.PRIMARY,
      };
    } else {
      return {
        label: 'Stake and Protect',
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
    <Button
      variant={btn.variant}
      onClick={() => onClick()}
      disabled={btn.disabled}
      className={`w-full`}
    >
      {btn.label}
    </Button>
  );
};
