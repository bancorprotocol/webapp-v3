import { NotificationsMenu } from 'elements/notifications/NotificationsMenu';
import { SettingsMenu } from 'elements/settings/SettingsMenu';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import 'elements/layoutHeader/LayoutHeader.css';
import { useWalletConnect } from '../walletConnect/useWalletConnect';
import { WalletConnectModal } from '../walletConnect/WalletConnectModal';
import { WalletConnectButton } from '../walletConnect/WalletConnectButton';
import { MarketingBannerMobile } from '../marketingBanner/MarketingBannerMobile';
import { useAppSelector } from 'redux/index';
import { DarkMode } from 'elements/settings/DarkMode';
import { NavLink } from 'react-router-dom';
import { pools, portfolio, swap, vote } from 'services/router';

export const LayoutHeader = () => {
  const wallet = useWalletConnect();
  const showBanner = useAppSelector<boolean>((state) => state.user.showBanner);

  return (
    <>
      <header className="layout-header">
        <div className="flex items-center justify-between w-[1140px]">
          <div className="flex items-center gap-30">
            <NavLink to={pools}>
              <IconBancor className="w-[18px]" />
            </NavLink>
            <NavLink to={swap} exact strict>
              Trade
            </NavLink>
            <NavLink to={pools} exact strict>
              Earn
            </NavLink>
            <NavLink to={vote} exact strict>
              Vote
            </NavLink>
            <NavLink to={portfolio} exact strict>
              Portfolio
            </NavLink>
          </div>

          <div className="flex items-center gap-20">
            <WalletConnectButton {...wallet} />
            <DarkMode />
            <NotificationsMenu />
            <SettingsMenu />
          </div>
        </div>
      </header>
      {showBanner && <MarketingBannerMobile />}
      <WalletConnectModal {...wallet} />
    </>
  );
};
