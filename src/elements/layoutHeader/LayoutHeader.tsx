import { NotificationsMenu } from 'elements/notifications/NotificationsMenu';
import { SettingsMenu } from 'elements/settings/SettingsMenu';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import 'elements/layoutHeader/LayoutHeader.css';
import { useWalletConnect } from '../walletConnect/useWalletConnect';
import { WalletConnectModal } from '../walletConnect/WalletConnectModal';
import { WalletConnectButton } from '../walletConnect/WalletConnectButton';
import { MarketingBannerMobile } from '../marketingBanner/MarketingBannerMobile';
import { useAppSelector } from 'redux/index';
import { NavLink } from 'react-router-dom';
import { pools, portfolio, swap, tokens, vote } from 'services/router';
import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';

export const LayoutHeader = () => {
  const wallet = useWalletConnect();
  const showBanner = useAppSelector<boolean>((state) => state.user.showBanner);

  return (
    <>
      <header className="flex items-center justify-center fixed w-full h-60 z-10 bg-fog dark:bg-black shadow-header dark:shadow-none">
        <div className="flex items-center justify-between w-[1140px] mx-20 md:mx-0">
          <div className="hidden md:flex items-center gap-30">
            <NavLink to={pools}>
              <IconBancor className="w-[18px]" />
            </NavLink>
            <TopMenuDropdown
              items={[
                { title: 'Trade', link: swap },
                { title: 'Tokens', link: tokens },
              ]}
              className="w-[115px]"
            />

            <NavLink to={pools} exact strict>
              Earn
            </NavLink>
            <TopMenuDropdown
              items={[
                { title: 'Vote', link: vote },
                { title: 'DAO Forum', link: 'https://gov.bancor.network' },
              ]}
              className="w-[125px]"
            />

            <NavLink to={portfolio} exact strict>
              Portfolio
            </NavLink>
          </div>
          <div className="md:hidden">
            <NavLink to={pools}>
              <IconBancor className="w-[18px]" />
            </NavLink>
          </div>
          <div className="flex items-center gap-20">
            {wallet.account && <NotificationsMenu />}
            <SettingsMenu />
            <WalletConnectButton {...wallet} />
          </div>
        </div>
      </header>
      {showBanner && <MarketingBannerMobile />}
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
    <Popover className="block relative">
      <Popover.Button>
        <TopMenuDropdownItem item={items[0]} />
      </Popover.Button>

      <DropdownTransition>
        <Popover.Panel
          className={`dropdown-menu flex flex-col gap-20 ${className}`}
        >
          {items.map((item) => (
            <TopMenuDropdownItem key={item.title} item={item} />
          ))}
        </Popover.Panel>
      </DropdownTransition>
    </Popover>
  );
};

const TopMenuDropdownItem = ({ item }: { item: TopMenu }) => {
  const href = item.link.startsWith('http');
  return (
    <NavLink
      exact
      strict
      to={{ pathname: item.link }}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener' : undefined}
    >
      {item.title}
    </NavLink>
  );
};
