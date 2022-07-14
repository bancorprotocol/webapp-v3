import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { DepositDisabledModal } from 'modals/DepositDisabledModal';

export const PoolsTableCellActions = (_id: string) => {
  return (
    <DepositDisabledModal
      renderButton={(onClick) => (
        <PopoverV3
          buttonElement={() => (
            <Button
              onClick={onClick}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.ExtraSmall}
            >
              Deposit
            </Button>
          )}
        >
          Deposit & Earn
        </PopoverV3>
      )}
    />
  );
};
