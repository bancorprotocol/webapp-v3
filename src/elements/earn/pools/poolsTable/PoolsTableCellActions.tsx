import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { DepositDisabledModal } from 'elements/earn/pools/poolsTable/v3/DepositDisabledModal';
import { Navigate } from 'components/navigate/Navigate';
import { BancorURL } from 'router/bancorURL.service';
import { useAppSelector } from 'store';

export const PoolsTableCellActions = (id: string) => {
  const enableDeposit = useAppSelector((state) => state.user.enableDeposit);

  const button = (onClick: () => void) => (
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
  );

  return enableDeposit ? (
    <Navigate className="w-full" to={BancorURL.addLiquidityV2(id)}>
      {button(() => {})}
    </Navigate>
  ) : (
    <DepositDisabledModal renderButton={(onclick) => button(onclick)} />
  );
};
