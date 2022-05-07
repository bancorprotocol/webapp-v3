import { Link } from 'react-router-dom';
import { Tooltip } from 'components/tooltip/Tooltip';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { BancorURL } from 'router/bancorURL.service';

export const PoolsTableCellActions = (id: string) => {
  return (
    <Link className="w-full" to={BancorURL.addLiquidityV2(id)}>
      <Tooltip content="Stake & Earn">
        <Button variant={ButtonVariant.PRIMARY} size={ButtonSize.EXTRASMALL}>
          Deposit
        </Button>
      </Tooltip>
    </Link>
  );
};
