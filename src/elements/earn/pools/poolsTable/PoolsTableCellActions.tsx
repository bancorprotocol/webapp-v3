import { NavLink } from 'react-router-dom';
import { Tooltip } from 'components/tooltip/Tooltip';
import { ReactComponent as IconPlus } from 'assets/icons/plus-circle.svg';
import { ReactComponent as IconSync } from 'assets/icons/sync.svg';
import { Pool } from 'services/observables/tokens';
import { bntToken } from 'services/web3/config';
import { useWeb3React } from '@web3-react/core';
import { EthNetworks } from 'services/web3/types';
import { addLiquidityByID, swapByfrom } from 'services/router';

export const PoolsTableCellActions = (pool: Pool) => {
  const { chainId } = useWeb3React();
  const bnt = bntToken(chainId ? chainId : EthNetworks.Mainnet);
  const tknAddress = pool.reserves.find((x) => x.address !== bnt)?.address;

  return (
    <div className="flex">
      <NavLink
        to={addLiquidityByID(pool.pool_dlt_id)}
        className="btn-primary btn-sm rounded-[12px] !w-[35px] !h-[35px] p-0 shadow-header mr-10"
      >
        <Tooltip
          content="Stake & Earn"
          button={
            <IconPlus
              className={`w-20 hover:rotate-180 transition-transform duration-300`}
            />
          }
        />
      </NavLink>
      <NavLink
        to={swapByfrom(tknAddress)}
        className="btn-outline-primary btn-sm rounded-[12px] !w-[35px] !h-[35px] p-0 border shadow-header"
      >
        <Tooltip
          content="Trade"
          button={
            <IconSync
              className={`w-20 hover:rotate-180 transition-transform duration-300`}
            />
          }
        />
      </NavLink>
    </div>
  );
};
