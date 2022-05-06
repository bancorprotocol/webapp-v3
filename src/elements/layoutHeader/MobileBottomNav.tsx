import { ReactComponent as IconTrade } from 'assets/icons/trade.svg';
import { ReactComponent as IconEarn } from 'assets/icons/earn.svg';
import { ReactComponent as IconPortfolio } from 'assets/icons/portfolio.svg';
import { ReactComponent as IconMore } from 'assets/icons/more.svg';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { MobileSidebar } from './MobileSidebar';
import { SettingsMenuContent } from 'elements/settings/SettingsMenu';
import { BancorRoutes } from 'router/routes.service';

export const MobileBottomNav = () => {
  const [show, setShow] = useState(false);

  return (
    <div className="md:hidden fixed bottom-0 flex items-center justify-between px-30 w-full h-60 z-30 bg-white dark:bg-black shadow-header text-10 text-black dark:text-white-low dark:text-white-low">
      <Link
        to={BancorRoutes.trade()}
        className="flex flex-col items-center gap-4"
      >
        <IconTrade className="w-16 text-black dark:text-white" />
        Trade
      </Link>
      <Link to={BancorRoutes.earn} className="flex flex-col items-center gap-4">
        <IconEarn className="w-18 text-black dark:text-white" />
        Earn
      </Link>
      <Link
        to={BancorRoutes.portfolio}
        className="flex flex-col items-center gap-4"
      >
        <IconPortfolio className="w-14 text-black dark:text-white" />
        Portfolio
      </Link>
      <button
        onClick={() => setShow(true)}
        className="flex flex-col items-center gap-[8px]"
      >
        <IconMore className="w-18 text-black dark:text-white" />
        More
      </button>

      <MobileSidebar show={show} setShow={setShow} showDarkMode>
        <SettingsMenuContent mobile />
      </MobileSidebar>
    </div>
  );
};
