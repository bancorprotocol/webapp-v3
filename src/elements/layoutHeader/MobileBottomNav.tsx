import { ReactComponent as IconTrade } from 'assets/icons/trade.svg';
import { ReactComponent as IconEarn } from 'assets/icons/earn.svg';
import { ReactComponent as IconPortfolio } from 'assets/icons/portfolio.svg';
import { ReactComponent as IconMore } from 'assets/icons/more.svg';

import { NavLink } from 'react-router-dom';
import { pools, portfolio, swap } from 'services/router';

export const MobileBottomNav = () => {
  return (
    <div className="md:hidden fixed bottom-0 flex items-center justify-between px-30 w-full h-60 z-30 bg-white dark:bg-black shadow-header text-10 text-black dark:text-white-low dark:text-white-low">
      <NavLink
        to={swap}
        exact
        strict
        className="flex flex-col items-center gap-4"
      >
        <IconTrade className="w-16 text-black dark:text-white" />
        Trade
      </NavLink>
      <NavLink
        to={pools}
        exact
        strict
        className="flex flex-col items-center gap-4"
      >
        <IconEarn className="w-18 text-black dark:text-white" />
        Earn
      </NavLink>
      <NavLink
        to={portfolio}
        exact
        strict
        className="flex flex-col items-center gap-4"
      >
        <IconPortfolio className="w-14 text-black dark:text-white" />
        Portfolio
      </NavLink>
      <button
        onClick={() => {}}
        className="flex flex-col items-center gap-[8px]"
      >
        <IconMore className="w-18 text-black dark:text-white" />
        More
      </button>
    </div>
  );
};
