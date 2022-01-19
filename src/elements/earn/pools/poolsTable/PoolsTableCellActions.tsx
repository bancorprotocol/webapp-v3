import { NavLink } from 'react-router-dom';
import { Tooltip } from 'components/tooltip/Tooltip';
import { addLiquidityByID } from 'services/router';
import { Button, ButtonVariant } from 'components/button/Button';

export const PoolsTableCellActions = (id: string) => {
  return (
    <NavLink to={addLiquidityByID(id)}>
      <Tooltip content="Stake & Earn">
        <Button variant={ButtonVariant.SECONDARY}>Stake</Button>
      </Tooltip>
    </NavLink>
  );
};
