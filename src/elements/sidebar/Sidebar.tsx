import { useState } from 'react';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import { ReactComponent as IconBancorText } from 'assets/icons/bancorText.svg';
import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';
import { ReactComponent as IconSync } from 'assets/icons/sync.svg';
import { classNameGenerator } from 'utils/pureFunctions';
import { MenuItem, NavItem } from 'elements/sidebar/NavItem';

export const Sidebar = () => {
  const [isMinimized, setIsMinimized] = useState(false);

  const menu: MenuItem[] = [
    {
      id: 0,
      label: 'Trade',
      to: '/',
      icon: <IconSync />,
      subMenu: [
        { id: 0, label: 'Swap', to: '/' },
        { id: 1, label: 'Tokens', to: '/tokens' },
      ],
    },
    {
      id: 1,
      label: 'Earn',
      to: '/404',
      icon: <IconSync />,
      subMenu: [
        { id: 0, label: 'Pools', to: '/' },
        { id: 1, label: 'Portfolio', to: '/tokens' },
      ],
    },
    {
      id: 2,
      label: 'Earn',
      to: '/404',
      icon: <IconSync />,
      subMenu: [
        { id: 0, label: 'Pools', to: '/' },
        { id: 1, label: 'Portfolio', to: '/tokens' },
      ],
    },
  ];

  console.log(menu);

  return (
    <div
      className={`fixed transition-all duration-700 ease-in-out z-20 ${
        isMinimized ? 'w-[66px]' : 'w-[200px]'
      }`}
    >
      <div className="text-grey-2 pt-[25px] h-screen bg-blue-4 rounded-r overflow-hidden">
        <div className="w-[200px] ">
          <div className="flex items-center mb-5 pl-[25px] ">
            <IconBancor className="w-[18px] mr-20" />
            <IconBancorText className="w-[76px]" />
          </div>

          <button onClick={() => setIsMinimized(!isMinimized)}>
            <div
              className={`absolute right-0 -mr-12 flex justify-center items-center border-2 border-white rounded-full bg-blue-4 w-[25px] h-[25px] transition-transform ease-in-out duration-700 transform transform-gpu ${classNameGenerator(
                {
                  'rotate-180': !isMinimized,
                }
              )}`}
            >
              <IconChevron className={`w-[16px] text-white`} />
            </div>
          </button>

          <nav className="mt-40">
            {menu.map((item) => {
              return <NavItem key={item.id} item={item} />;
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};
