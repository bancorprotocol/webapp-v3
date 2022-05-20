import { NotificationsMenu } from 'elements/notifications/NotificationsMenu';
import { SettingsMenu } from 'elements/settings/SettingsMenu';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
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
        className={`fixed flex items-center justify-center w-full h-60 z-30 transition-colors ease-in-out duration-300 ${
          isTop
            ? ''
            : 'bg-white dark:bg-black dark:border-b dark:border-charcoal'
        }`}
      >
        <div className="flex items-center justify-between w-full mx-20">
          <div className="hidden md:flex items-center gap-30">
            <Navigate to={BancorURL.earn}>
              <IconBancor className="w-[18px]" />
            </Navigate>
            <TopMenuDropdown
              items={[
                { title: 'Trade', link: BancorURL.trade() },
                { title: 'Tokens', link: BancorURL.tokens },
              ]}
              className="w-[75px]"
            />

            <Navigate to={BancorURL.earn}>Earn</Navigate>
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
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75">
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
      options={{
        placement: 'bottom-start',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [-30, 20],
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
