import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { useDispatch } from 'react-redux';
import { setDisableDepositOpen } from 'store/modals/modals';

export const PoolsTableCellActions = (_id: string) => {
  const dispatch = useDispatch();

  return (
    <PopoverV3
      buttonElement={() => (
        <Button
          onClick={() => dispatch(setDisableDepositOpen(true))}
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.ExtraSmall}
        >
          Deposit
        </Button>
      )}
    >
      Deposit & Earn
    </PopoverV3>
  );
};
