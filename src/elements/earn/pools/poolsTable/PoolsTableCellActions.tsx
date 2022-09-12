import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { useDispatch } from 'react-redux';
import { pushModal } from 'store/modals/modals';
import { ModalNames } from 'modals';

export const PoolsTableCellActions = (_id: string) => {
  const dispatch = useDispatch();

  return (
    <PopoverV3
      buttonElement={() => (
        <Button
          onClick={() => dispatch(pushModal(ModalNames.DepositDisabled))}
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
