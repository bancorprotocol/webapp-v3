import { ReactComponent as IconTrade } from 'assets/icons/trade.svg';
import { ReactComponent as IconEarn } from 'assets/icons/earn.svg';
import { ReactComponent as IconPortfolio } from 'assets/icons/portfolio.svg';
import { ReactComponent as IconMore } from 'assets/icons/more.svg';
import { useState } from 'react';
import { MobileSidebar } from './MobileSidebar';
import { SettingsMenuContent } from 'elements/settings/SettingsMenu';
import { BancorURL } from 'router/bancorURL.service';
import { Navigate } from 'components/navigate/Navigate';

export const MobileBottomNav = () => {
  const [show, setShow] = useState(false);

  return (
    <div className="fixed bottom-0 z-30 flex items-center justify-between w-full text-black bg-white md:hidden px-30 h-60 dark:bg-black shadow-header text-10 dark:text-white-low">
      <Navigate
        to={BancorURL.trade()}
        className="flex flex-col items-center gap-4"
      >
        <IconTrade className="w-16 text-black dark:text-white" />
        Trade
      </Navigate>
      <Navigate
        to={BancorURL.earn}
        className="flex flex-col items-center gap-4"
      >
        <IconEarn className="text-black w-18 dark:text-white" />
        Pools
      </Navigate>
      <Navigate
        to={BancorURL.portfolio}
        className="flex flex-col items-center gap-4"
      >
        <IconPortfolio className="text-black w-14 dark:text-white" />
        Portfolio
      </Navigate>
      <button
        onClick={() => setShow(true)}
        className="flex flex-col items-center gap-[8px]"
      >
        <IconMore className="text-black w-18 dark:text-white" />
        More
      </button>

      <MobileSidebar show={show} setShow={setShow} showDarkMode>
        <SettingsMenuContent mobile />
      </MobileSidebar>
    </div>
  );
};
