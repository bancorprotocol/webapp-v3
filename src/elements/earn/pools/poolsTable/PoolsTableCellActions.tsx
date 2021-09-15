import { NavLink } from 'react-router-dom';
import { Tooltip } from 'components/tooltip/Tooltip';
import { ReactComponent as IconPlus } from 'assets/icons/plus-circle.svg';
import { ReactComponent as IconSync } from 'assets/icons/sync.svg';
import { Pool } from 'services/observables/tokens';

export const PoolsTableCellActions = (pool: Pool) => {
  const href = pool.isProtectionAllowed
    ? `https://app.bancor.network/eth/portfolio/stake/add/single/${pool.pool_dlt_id}`
    : `https://app.bancor.network/eth/pool/add/${pool.pool_dlt_id}`;

  return (
    <div className="flex">
      <a
        href={href}
        target="_blank"
        className="btn-primary btn-sm rounded-[12px] !w-[35px] !h-[35px] p-0 shadow-header mr-10"
        rel="noreferrer"
      >
        <Tooltip
          content="Stake & Earn"
          button={
            <IconPlus
              className={`w-20 hover:rotate-180 transition-transform duration-300`}
            />
          }
        />
      </a>
      <NavLink
        to="/"
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
