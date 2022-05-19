import { Navigate } from 'components/navigate/Navigate';
import { Tooltip } from 'components/tooltip/Tooltip';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { BancorURL } from 'router/bancorURL.service';

export const PoolsTableCellActions = (id: string) => {
  return (
    <Navigate className="w-full" to={BancorURL.addLiquidityV2(id)}>
      <Tooltip content="Stake & Earn">
        <Button variant={ButtonVariant.Primary} size={ButtonSize.ExtraSmall}>
          Deposit
        </Button>
      </Tooltip>
    </Navigate>
  );
};
