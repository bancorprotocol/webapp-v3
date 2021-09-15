import { NavLink } from 'react-router-dom';
import { Tooltip } from 'components/tooltip/Tooltip';
import { ReactComponent as IconPlus } from 'assets/icons/plus-circle.svg';
import { ReactComponent as IconSync } from 'assets/icons/sync.svg';

export const PoolsTableCellActions = () => {
  return (
    <div className="flex">
      <NavLink
        to="/"
        className="btn-primary btn-sm rounded-[12px] !w-[35px] !h-[35px] p-0 shadow-header mr-10"
      >
        <Tooltip
          content="Coming Soon"
          button={
            <IconPlus
              className={`w-20 hover:rotate-180 transition-transform duration-300`}
            />
          }
        />
      </NavLink>
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
