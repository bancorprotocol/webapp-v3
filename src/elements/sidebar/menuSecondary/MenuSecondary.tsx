import { ReactComponent as IconApps } from 'assets/icons/apps.svg';
import { ReactComponent as IconCommunity } from 'assets/icons/community.svg';
import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';
import { ReactComponent as IconDeveloper } from 'assets/icons/developers.svg';
import { Popover } from '@headlessui/react';
import { ReactComponent as IconBell } from 'assets/icons/bell.svg';
import { DropdownTransition } from 'components/transitions/DropdownTransition';

interface MenuSecondaryProps {
  isMinimized: boolean;
  setIsSidebarOpen?: Function;
}

const menu = [
  {
    label: 'Apps',
    icon: <IconApps />,
    subMenu: [
      {
        label: 'Bancor Wallet',
        icon: <IconCommunity />,
      },
    ],
  },
  {
    label: 'Community',
    icon: <IconCommunity />,
    subMenu: [
      {
        label: 'Bancor Wallet',
        icon: <IconCommunity />,
      },
    ],
  },
  {
    label: 'Developers',
    icon: <IconDeveloper />,
    subMenu: [
      {
        label: 'Bancor Wallet',
        icon: <IconCommunity />,
      },
    ],
  },
];

export const MenuSecondary = ({
  isMinimized,
  setIsSidebarOpen,
}: MenuSecondaryProps) => {
  return (
    <>
      <hr className="mx-20" />
      <div className="p-20 text-12 space-y-16">
        {menu.map((item, index) => {
          return (
            <Popover key={index} className="relative">
              <Popover.Button className="w-full flex items-center justify-between overflow-hidden">
                <span className="flex items-center">
                  <span className="ml-2 mr-20">{item.icon}</span>
                  {item.label}
                </span>
                <span>
                  <IconChevron className="w-16" />
                </span>
              </Popover.Button>

              <DropdownTransition>
                <Popover.Panel
                  className={`absolute w-[225px] py-20 bg-blue-4 bottom-[-23px] px-24 left-0 rounded z-10 ${
                    isMinimized ? 'ml-[66px]' : 'ml-[200px]'
                  }`}
                >
                  <div className="absolute h-14 w-14 transform bottom-24 left-[-7px] rotate-45 bg-blue-4" />

                  <div className="-mr-18 pr-18 max-h-[400px] overflow-auto">
                    <div className="dropdown-header flex justify-between">
                      <h3 className="text-16 font-semibold">{item.label}</h3>
                    </div>

                    {item.subMenu.map((subItem, index) => {
                      return <div key={index}>{subItem.label}</div>;
                    })}
                  </div>
                </Popover.Panel>
              </DropdownTransition>
            </Popover>
          );
        })}
      </div>
    </>
  );
};
