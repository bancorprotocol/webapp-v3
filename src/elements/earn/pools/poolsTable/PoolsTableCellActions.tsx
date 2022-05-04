import { NavLink } from 'react-router-dom';
import { Tooltip } from 'components/tooltip/Tooltip';
import { addLiquidityByID } from 'services/router';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';

export const PoolsTableCellActions = (id: string) => {
  return (
    <NavLink className="w-full" to={addLiquidityByID(id)}>
      <Tooltip content="Stake & Earn">
        <Button variant={ButtonVariant.PRIMARY} size={ButtonSize.EXTRASMALL}>
          Deposit
        </Button>
      </Tooltip>
    </NavLink>
  );
};
