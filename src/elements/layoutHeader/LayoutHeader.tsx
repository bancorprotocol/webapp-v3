import { NotificationsMenu } from 'elements/notifications/NotificationsMenu';
import { SettingsMenu } from 'elements/settings/SettingsMenu';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import { useWalletConnect } from '../walletConnect/useWalletConnect';
import { WalletConnectModal } from '../walletConnect/WalletConnectModal';
import { WalletConnectButton } from '../walletConnect/WalletConnectButton';
import { NavLink } from 'react-router-dom';
import { pools, portfolio, swap, tokens, vote } from 'services/router';
import { Popover } from '@headlessui/react';
import { useState } from 'react';
import { NetworkIndicator } from './NetworkIndicator';
import { isForkAvailable } from 'services/web3/config';
import { useTopScroll } from 'hooks/useTopScroll';
import 'elements/layoutHeader/LayoutHeader.css';

export const LayoutHeader = () => {
  const wallet = useWalletConnect();
  const top = useTopScroll();

  return (
    <>
      <header
        className={`fixed flex items-center justify-center w-full h-60 z-30 transition-colors ease-in-out duration-300 ${
          top ? '' : 'bg-white dark:bg-black-medium'
        }`}
      >
        <div className="flex items-center justify-between w-full mx-20">
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
            {isForkAvailable && <NetworkIndicator />}
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
      <WalletConnectModal {...wallet} />
    </>
  );
};

interface TopMenu {
  title: string;
  link: string;
}

let timeout: NodeJS.Timeout;
let prevPopFunc: Function = () => {};

const TopMenuDropdown = ({
  items,
  className,
}: {
  items: TopMenu[];
  className: string;
}) => {
  const [open, setOpen] = useState(false);

  const openPopover = () => {
    prevPopFunc();
    clearInterval(timeout);
    setOpen(true);
  };

  const closePopover = (delay: number) => {
    prevPopFunc = () => setOpen(false);
    timeout = setTimeout(() => setOpen(false), delay);
  };
  return (
    <Popover className="block relative">
      <Popover.Button
        onMouseEnter={() => openPopover()}
        onMouseLeave={() => closePopover(600)}
      >
        <TopMenuDropdownItem item={items[0]} />
      </Popover.Button>

      {open && (
        <Popover.Panel
          static
          onMouseEnter={() => openPopover()}
          onMouseLeave={() => closePopover(200)}
          className={`dropdown-menu flex flex-col gap-20 ${className}`}
        >
          {items.map((item) => (
            <TopMenuDropdownItem key={item.title} item={item} />
          ))}
        </Popover.Panel>
      )}
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
