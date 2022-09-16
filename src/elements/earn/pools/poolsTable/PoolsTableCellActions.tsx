import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { useDispatch } from 'react-redux';
import { pushModal } from 'store/modals/modals';
import { ModalNames } from 'modals';
import { useNavigation } from 'hooks/useNavigation';

export const PoolsTableCellActions = (id: string) => {
  const dispatch = useDispatch();
  const { goToPage } = useNavigation();
  const enableDeposit = false;

  return (
    <PopoverV3
      buttonElement={() => (
        <Button
          onClick={() =>
            enableDeposit
              ? goToPage.addLiquidityV2(id)
              : dispatch(pushModal({ modal: ModalNames.DepositDisabled }))
          }
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
