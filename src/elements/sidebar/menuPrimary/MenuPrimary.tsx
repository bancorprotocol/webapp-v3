import { ReactComponent as IconSync } from 'assets/icons/sync.svg';
import { ReactComponent as IconEarn } from 'assets/icons/earn.svg';
import { ReactComponent as IconVote } from 'assets/icons/vote.svg';
import { ReactComponent as IconFiat } from 'assets/icons/fiat.svg';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MenuPrimaryItem } from 'elements/sidebar/menuPrimary/MenuPrimaryItem';
import { sendGTMPath } from 'services/api/googleTagManager';
import usePrevious from 'hooks/usePrevious';
import { useAppSelector } from 'redux/index';

export interface BaseMenuItem {
  label: string;
  to: string;
}

export interface MenuItem extends BaseMenuItem {
  icon: JSX.Element;
  subMenu: BaseMenuItem[];
}

interface MenuPrimaryProps {
  isMinimized: boolean;
  setIsSidebarOpen?: Function;
}

const menu: MenuItem[] = [
  {
    label: 'Trade',
    to: '/',
    icon: <IconSync />,
    subMenu: [
      { label: 'Swap', to: '/' },
      // { label: 'Tokens', to: '/tokens' },
    ],
  },
  // {
  //   label: 'Earn',
  //   to: '/portfolio',
  //   icon: <IconEarn />,
  //   subMenu: [
  //     { label: 'Portfolio', to: '/portfolio' },
  //     { label: 'Pools', to: '/pools' },
  //   ],
  // },
  // {
  //   label: 'DAO',
  //   to: '/governance',
  //   icon: <IconVote />,
  //   subMenu: [
  //     { label: 'Governance', to: '/governance' },
  //     { label: 'Vote', to: '/vote' },
  //   ],
  // },
  // {
  //   label: 'Fiat',
  //   to: '/fiat',
  //   icon: <IconFiat />,
  //   subMenu: [],
  // },
];

export const MenuPrimary = ({
  isMinimized,
  setIsSidebarOpen,
}: MenuPrimaryProps) => {
  const [activeNav, setActiveNav] = useState<number | null>(null);
  const location = useLocation();
  const prevLocation = usePrevious(location);
  const darkMode = useAppSelector<boolean>((state) => state.user.darkMode);

  useEffect(() => {
    setActiveNav(
      menu.findIndex(
        (x) =>
          location.pathname === x.to ||
          x.subMenu.some((sub) => sub.to === location.pathname)
      )
    );
    sendGTMPath(prevLocation?.pathname, location.pathname, darkMode);
  }, [location, darkMode, prevLocation]);

  return (
    <nav className="mt-30">
      {menu.map((item, index) => {
        return (
          <MenuPrimaryItem
            key={index}
            {...item}
            isActive={activeNav === index}
            isMinimized={isMinimized}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        );
      })}
    </nav>
  );
};
