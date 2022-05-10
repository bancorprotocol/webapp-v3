import { openWalletModal } from 'store/user/user';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'store';
import { Button, ButtonVariant } from 'components/button/Button';

interface Props {
  onStart: Function;
  amount: string;
  errorMsg: string;
}

export const AddLiquiditySingleCTA = ({ onStart, amount, errorMsg }: Props) => {
  const dispatch = useDispatch();
  const account = useAppSelector((state) => state.user.account);

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

  const onClick = () => {
    if (!account) {
      dispatch(openWalletModal(true));
    } else {
      onStart();
    }
  };

  const btn = button();

  return (
    <Button
      onClick={() => onClick()}
      disabled={btn.disabled}
      variant={btn.variant}
      className={`w-full`}
    >
      {button().label}
    </Button>
  );
};
