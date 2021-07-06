import { ReactComponent as IconApps } from 'assets/icons/apps.svg';
import { ReactComponent as IconCommunity } from 'assets/icons/community.svg';
import { ReactComponent as IconDeveloper } from 'assets/icons/developers.svg';
import { ReactComponent as IconWallet } from 'assets/icons/bancorwallet.svg';
import { ReactComponent as IconX } from 'assets/icons/bancorx.svg';
import { ReactComponent as IconAnalytics } from 'assets/icons/bancoranalytics.svg';
import { ReactComponent as IconTwitter } from 'assets/icons/twitter.svg';
import { ReactComponent as IconReddit } from 'assets/icons/reddit.svg';
import { ReactComponent as IconTelegram } from 'assets/icons/telegram.svg';
import { ReactComponent as IconDiscord } from 'assets/icons/discord.svg';
import { ReactComponent as IconDocument } from 'assets/icons/document.svg';
import { ReactComponent as IconGithub } from 'assets/icons/github.svg';
import { ReactComponent as IconBntee } from 'assets/icons/bnteeshop.svg';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';

import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { MenuSecondaryItem } from 'elements/sidebar/menuSecondary/MenuSecondaryItem';
import { MenuSecondaryItemSub } from 'elements/sidebar/menuSecondary/MenuSecondaryItemSub';
import { useState } from 'react';
import { ModalFullscreen } from 'components/modalFullscreen/ModalFullscreen';

export interface SecondarySubMenuItem {
  label: string;
  to: string;
  icon: JSX.Element;
}

export interface SecondaryMenuItem {
  label: string;
  icon: JSX.Element;
  subMenu: SecondarySubMenuItem[];
}

const menu: SecondaryMenuItem[] = [
  {
    label: 'Apps',
    icon: <IconApps />,
    subMenu: [
      {
        label: 'Bancor X',
        to: 'https://x.bancor.network',
        icon: <IconX />,
      },
      {
        label: 'Bancor Wallet',
        to: 'https://wallet.bancor.network',
        icon: <IconWallet />,
      },
      {
        label: 'BNTEE Shop',
        to: 'https://www.bntee.shop/',
        icon: <IconBntee />,
      },
      {
        label: 'Bancor Analytics',
        to: 'https://duneanalytics.com/Bancor/bancor_1',
        icon: <IconAnalytics />,
      },
    ],
  },
  {
    label: 'Community',
    icon: <IconCommunity />,
    subMenu: [
      {
        label: 'Twitter',
        to: 'https://twitter.com/Bancor',
        icon: <IconTwitter />,
      },
      {
        label: 'Reddit',
        to: 'https://www.reddit.com/r/Bancor/',
        icon: <IconReddit />,
      },
      {
        label: 'Telegram',
        to: 'https://t.me/bancor',
        icon: <IconTelegram />,
      },
      {
        label: 'Discord',
        to: 'https://discord.gg/CAm3Ncyrxk',
        icon: <IconDiscord />,
      },
    ],
  },
  {
    label: 'Developers',
    icon: <IconDeveloper />,
    subMenu: [
      {
        label: 'Docs',
        to: 'https://docs.bancor.network/',
        icon: <IconDocument />,
      },
      {
        label: 'GitHub',
        to: 'https://github.com/bancorprotocol/',
        icon: <IconGithub />,
      },
      {
        label: 'Telegram',
        to: 'https://t.me/BancorDevelopers',
        icon: <IconTelegram />,
      },
    ],
  },
];

interface MenuSecondaryProps {
  isMinimized: boolean;
}

export const MenuSecondary = ({ isMinimized }: MenuSecondaryProps) => {
  const [showModal, setShowModal] = useState(false);
  const [menuIndex, setMenuIndex] = useState(0);

  const openMobileMenu = (index: number) => {
    setMenuIndex(index);
    setShowModal(true);
  };

  return (
    <>
      <hr className="mx-20" />
      <nav className="hidden md:block p-20 text-12 space-y-16">
        {menu.map((item, index) => {
          return (
            <Popover key={index} className="relative">
              <Popover.Button className="w-full">
                <MenuSecondaryItem {...item} />
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
                    <div className="space-y-20">
                      {item.subMenu.map((subItem, index) => {
                        return (
                          <MenuSecondaryItemSub key={index} {...subItem} />
                        );
                      })}
                    </div>
                  </div>
                </Popover.Panel>
              </DropdownTransition>
            </Popover>
          );
        })}
      </nav>

      <nav className="md:hidden p-20 text-12 space-y-16">
        {menu.map((item, index) => {
          return (
            <button
              key={index}
              onClick={() => openMobileMenu(index)}
              className="w-full"
            >
              <MenuSecondaryItem {...item} />
            </button>
          );
        })}
      </nav>

      <ModalFullscreen
        title={menu[menuIndex].label}
        setIsOpen={setShowModal}
        isOpen={showModal}
        showHeader
      >
        <div className="space-y-20">
          {menu[menuIndex].subMenu.map((subItem, index) => {
            return <MenuSecondaryItemSub key={index} {...subItem} />;
          })}
        </div>
      </ModalFullscreen>
    </>
  );
};
