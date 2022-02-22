import { NavLink } from 'react-router-dom';
import { Tooltip } from 'components/tooltip/Tooltip';
import { addLiquidityByID } from 'services/router';
import { Button, ButtonVariant } from 'components/button/Button';

export const PoolsTableCellActions = (id: string) => {
  return (
    <NavLink className="w-full" to={addLiquidityByID(id)}>
      <Tooltip content="Stake & Earn">
        <Button
          className=" h-30 w-90 bg-fog dark:bg-grey"
          variant={ButtonVariant.SECONDARY}
        >
          Deposit
        </Button>
      </Tooltip>
    </NavLink>
  );
};
