import { Navigate } from 'components/navigate/Navigate';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { BancorURL } from 'router/bancorURL.service';
import { PopoverV3 } from 'components/popover/PopoverV3';

export const PoolsTableCellActions = (id: string) => {
  return (
    <Navigate className="w-full" to={BancorURL.addLiquidityV2(id)}>
      <PopoverV3
        buttonElement={() => (
          <Button variant={ButtonVariant.Tertiary} size={ButtonSize.ExtraSmall}>
            Deposit
          </Button>
        )}
      >
        Deposit & Earn
      </PopoverV3>
    </Navigate>
  );
};
