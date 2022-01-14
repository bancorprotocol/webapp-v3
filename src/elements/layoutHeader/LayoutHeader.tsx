import { NotificationsMenu } from 'elements/notifications/NotificationsMenu';
import { SettingsMenu } from 'elements/settings/SettingsMenu';
import { LayoutHeaderMobile } from 'elements/layoutHeader/LayoutHeaderMobile';
import { ReactComponent as IconHamburger } from 'assets/icons/hamburger.svg';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import 'elements/layoutHeader/LayoutHeader.css';
import { useWalletConnect } from '../walletConnect/useWalletConnect';
import { WalletConnectModal } from '../walletConnect/WalletConnectModal';
import { WalletConnectButton } from '../walletConnect/WalletConnectButton';
import { MarketingBannerMobile } from '../marketingBanner/MarketingBannerMobile';
import { useAppSelector } from 'redux/index';
import { NetworkIndicator } from './NetworkIndicator';

interface LayoutHeaderProps {
  isMinimized: boolean;
  setIsSidebarOpen: Function;
}

export const LayoutHeader = ({
  isMinimized,
  setIsSidebarOpen,
}: LayoutHeaderProps) => {
  const wallet = useWalletConnect();
  const showBanner = useAppSelector<boolean>((state) => state.user.showBanner);

  return (
    <>
      <header className="layout-header">
        <div
          className={`transition-all duration-500 ${
            isMinimized ? 'ml-[96px]' : 'ml-[230px]'
          } mr-30 w-full`}
        >
          <div className="layout-header-content">
            <div className="flex items-center">
              <NetworkIndicator />
            </div>

            <div className="flex items-center">
              <WalletConnectButton {...wallet} />
              <NotificationsMenu />
              <span className="text-graphite text-20 mx-16">|</span>
              <SettingsMenu />
            </div>
          </div>
        </div>
      </header>
      <LayoutHeaderMobile>
        <button onClick={() => setIsSidebarOpen(true)}>
          <IconHamburger className="w-[27px]" />
        </button>
        <div className="flex justify-center">
          <IconBancor className="w-[23px]" />
        </div>
        <div className="flex items-center justify-end">
          <NotificationsMenu />
          <div className="bg-grey w-[1px] h-30 mx-10" />
          <WalletConnectButton {...wallet} />
        </div>
      </LayoutHeaderMobile>
      {showBanner && <MarketingBannerMobile />}
      <WalletConnectModal {...wallet} />
    </>
  );
};
