import { NavLink } from 'react-router-dom';
import { Tooltip } from 'components/tooltip/Tooltip';
import { ReactComponent as IconPlus } from 'assets/icons/plus-circle.svg';
import { ReactComponent as IconSync } from 'assets/icons/sync.svg';
import { Pool } from 'services/observables/tokens';
import { bntToken } from 'services/web3/config';
import { useWeb3React } from '@web3-react/core';
import { EthNetworks } from 'services/web3/types';
import { addLiquidityByID, swapByfrom } from 'services/router';
import { ButtonIcon } from 'components/button/ButtonIcon';

export const PoolsTableCellActions = (pool: Pool) => {
  const { chainId } = useWeb3React();
  const bnt = bntToken(chainId ? chainId : EthNetworks.Mainnet);
  const tknAddress = pool.reserves.find((x) => x.address !== bnt)?.address;

  return (
    <div className="flex space-x-10">
      <NavLink to={addLiquidityByID(pool.pool_dlt_id)}>
        <Tooltip content="Stake & Earn">
          <ButtonIcon animate>
            <IconPlus />
          </ButtonIcon>
        </Tooltip>
      </NavLink>
      <NavLink to={swapByfrom(tknAddress)}>
        <Tooltip content="Stake & Earn">
          <ButtonIcon secondary animate>
            <IconSync />
          </ButtonIcon>
        </Tooltip>
      </NavLink>
    </div>
  );
};
