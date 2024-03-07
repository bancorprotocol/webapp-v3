import { NotificationsMenu } from 'elements/notifications/NotificationsMenu';
import { SettingsMenu } from 'elements/settings/SettingsMenu';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';
import { useWalletConnect } from '../walletConnect/useWalletConnect';
import { WalletConnectModal } from '../walletConnect/WalletConnectModal';
import { WalletConnectButton } from '../walletConnect/WalletConnectButton';
import { useEffect, useState } from 'react';
import { NetworkIndicator } from './NetworkIndicator';
import { isForkAvailable } from 'services/web3/config';
import 'elements/layoutHeader/LayoutHeader.css';
import { useAppSelector } from 'store/index';
import { getIsAppBusy } from 'store/bancor/bancor';
import { BancorURL } from 'router/bancorURL.service';
import { Navigate } from 'components/navigate/Navigate';
import { PopoverV3 } from 'components/popover/PopoverV3';

export const LayoutHeader = () => {
  const wallet = useWalletConnect();
  const [isTop, setIsTop] = useState(true);

  const isLoading = useAppSelector(getIsAppBusy);

  useEffect(() => {
    const listener = () => setIsTop(window.pageYOffset === 0);
    window.addEventListener('scroll', listener);

    return () => {
      window.removeEventListener('scroll', listener);
    };
  }, [isTop]);

  return (
    <>
      <header
        className={`fixed flex items-center flex-col justify-center w-full h-[150px] z-30 transition-colors ease-in-out duration-300 ${
          isTop
            ? ''
            : 'bg-white dark:bg-black dark:border-b dark:border-charcoal'
        }`}
      >
        <div className="h-[90px] bg-black w-full text-white flex items-center justify-center space-x-20 px-10">
          <div className="h-50 w-50 shrink-0 border border-white/20 rounded-10 flex items-center justify-center relative">
            <div className="absolute text-[9px] text-[#00B578] bg-[#002D1E] px-10 py-3 rounded-full -top-10 -right-20">
              NEW
            </div>
            <img src="/carbon.png" alt="Carbon Logo" className="w-24" />
          </div>
          <div className="text-center hidden md:block">
            <b>Carbon DeFi is Live!</b> - Automate your crypto trading
            strategies onchain
          </div>
          <div className="text-center md:hidden">
            <div>
              <b>Carbon DeFi</b>
            </div>
            <div>Automate your trading strategies onchain</div>
          </div>
          <a
            href="https://carbondefi.xyz"
            target="_blank"
            rel="noreferrer"
            className="text-[#00B578] bg-[#002D1E] px-10 md:px-20 py-5 rounded-full flex items-center"
          >
            Try <span className="hidden md:block">App</span>{' '}
            <IconChevron className="w-16 h-16 ml-6" />
          </a>
        </div>
        <div className="flex items-center justify-between flex-row h-60 w-full px-20">
          <div className="items-center hidden md:flex gap-30">
            <Navigate to={BancorURL.earn}>
              <IconBancor className="w-[18px]" />
            </Navigate>

            <Navigate to={BancorURL.trade()}>Trade</Navigate>

            <Navigate to={BancorURL.earn}>Pools</Navigate>
            <TopMenuDropdown
              items={[
                { title: 'Vote', link: BancorURL.vote },
                { title: 'DAO Forum', link: 'https://gov.bancor.network' },
              ]}
              className="w-[95px]"
            />

            <Navigate to={BancorURL.portfolio}>Portfolio</Navigate>
            {isForkAvailable && <NetworkIndicator />}
          </div>
          <div className="md:hidden">
            <Navigate to={BancorURL.earn}>
              <IconBancor className="w-[18px]" />
            </Navigate>
          </div>
          <div className="flex items-center gap-20">
            {isLoading && (
              <div className="h-[20px] w-[20px]">
                <span className="absolute flex items-center justify-center h-[20px] w-[20px]">
                  <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-primary">
                    &nbsp;
                  </span>
                  <span className="relative inline-flex rounded-full h-[12px] w-[12px] bg-primary/60">
                    &nbsp;
                  </span>
                </span>
              </div>
            )}
            {wallet.account && <NotificationsMenu />}
            <SettingsMenu />
            <WalletConnectButton {...wallet} />
          </div>
        </div>
      </header>
      <WalletConnectModal {...wallet} />
    </>
  );
};

interface TopMenu {
  title: string;
  link: string;
}

const TopMenuDropdown = ({
  items,
  className,
}: {
  items: TopMenu[];
  className: string;
}) => {
  return (
    <PopoverV3
      buttonElement={() => (
        <Navigate to={items[0].link}>{items[0].title}</Navigate>
      )}
      showArrow={false}
      options={{
        placement: 'bottom-start',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [-25, 20],
            },
          },
        ],
      }}
    >
      <div className={`flex flex-col space-y-15 ${className}`}>
        {items.map((item) => (
          <Navigate
            key={item.title}
            to={item.link}
            className="hover:text-primary"
          >
            {item.title}
          </Navigate>
        ))}
      </div>
    </PopoverV3>
  );
};
