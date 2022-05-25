import { openWalletModal } from 'store/user/user';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'store';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { useNavigation } from 'hooks/useNavigation';

interface Props {
  onStart: Function;
  amount: string;
  errorMsg: string;
  isBNTSelected: boolean;
}

export const AddLiquiditySingleCTA = ({
  onStart,
  amount,
  errorMsg,
  isBNTSelected,
}: Props) => {
  const dispatch = useDispatch();
  const account = useAppSelector((state) => state.user.account);
  const { goToPage } = useNavigation();

  const button = () => {
    if (isBNTSelected)
      return {
        label: 'Deposits are available on V3 pool',
        disabled: false,
        variant: ButtonVariant.Error,
      };
    if (errorMsg) {
      return { label: errorMsg, disabled: true, variant: ButtonVariant.Error };
    }
    if (!amount) {
      return {
        label: 'Enter amount',
        disabled: true,
        variant: ButtonVariant.Primary,
      };
    } else {
      return {
        label: 'Deposit and Protect',
        disabled: false,
        variant: ButtonVariant.Primary,
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
      onClick={() => (isBNTSelected ? goToPage.earn() : onClick())}
      disabled={btn.disabled}
      variant={btn.variant}
      size={ButtonSize.Full}
    >
      {button().label}
    </Button>
  );
};
