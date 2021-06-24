import { useEffect, useState } from 'react';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import { ReactComponent as IconBancorText } from 'assets/icons/bancorText.svg';
import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';
import { ReactComponent as IconSync } from 'assets/icons/sync.svg';
import { ReactComponent as IconEarn } from 'assets/icons/earn.svg';
import { ReactComponent as IconVote } from 'assets/icons/vote.svg';
import { ReactComponent as IconFiat } from 'assets/icons/fiat.svg';
import { classNameGenerator } from 'utils/pureFunctions';
import { NavItem } from 'elements/sidebar/NavItem';
import { useLocation } from 'react-router-dom';

export interface BaseMenuItem {
  label: string;
  to: string;
}

export interface MenuItem extends BaseMenuItem {
  icon: JSX.Element;
  subMenu: BaseMenuItem[];
}

const menu: MenuItem[] = [
  {
    label: 'Trade',
    to: '/',
    icon: <IconSync />,
    subMenu: [
      { label: 'Swap', to: '/' },
      { label: 'Tokens', to: '/tokens' },
    ],
  },
  {
    label: 'Earn',
    to: '/portfolio',
    icon: <IconEarn />,
    subMenu: [
      { label: 'Pools', to: '/pools' },
      { label: 'Portfolio', to: '/portfolio' },
    ],
  },
  {
    label: 'DAO',
    to: '/governance',
    icon: <IconVote />,
    subMenu: [
      { label: 'Governance', to: '/governance' },
      { label: 'Vote', to: '/vote' },
    ],
  },
  {
    label: 'Fiat',
    to: '/fiat',
    icon: <IconFiat />,
    subMenu: [],
  },
];

export const Sidebar = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeNav, setActiveNav] = useState(0);
  const location = useLocation();

  useEffect(() => {
    setActiveNav(
      menu.findIndex(
        (x) =>
          location.pathname === x.to ||
          x.subMenu.some((sub) => sub.to === location.pathname)
      )
    );
  }, [location]);

  return (
    <div
      className={`fixed text-grey-2 transition-all duration-700 ease-in-out z-20 ${
        isMinimized ? 'w-[66px]' : 'w-[200px]'
      }`}
    >
      <div className="pt-[25px] h-screen bg-blue-4 rounded-r overflow-hidden">
        <div className="w-[200px] ">
          <div className="flex items-center mb-5 pl-[25px] ">
            <IconBancor className="w-[18px] mr-20" />
            <IconBancorText className="w-[76px]" />
          </div>

          <button onClick={() => setIsMinimized(!isMinimized)}>
            <div
              className={`sidebar-toggle ${classNameGenerator({
                'rotate-180': !isMinimized,
              })}`}
            >
              <IconChevron className={`w-[16px] text-white`} />
            </div>
          </button>

          <nav className="mt-40">
            {menu.map((item, index) => {
              return (
                <NavItem
                  key={index}
                  {...item}
                  isActive={activeNav === index}
                  isMinimized={isMinimized}
                />
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};
