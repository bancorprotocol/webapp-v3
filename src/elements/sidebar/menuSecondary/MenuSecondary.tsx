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

import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { MenuSecondaryItem } from 'elements/sidebar/menuSecondary/MenuSecondaryItem';
import { MenuSecondaryItemSub } from 'elements/sidebar/menuSecondary/MenuSecondaryItemSub';

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
        to: 'https://x.bancor.network',
        icon: <IconTwitter />,
      },
      {
        label: 'Reddit',
        to: 'https://x.bancor.network',
        icon: <IconReddit />,
      },
      {
        label: 'Telegram',
        to: 'https://x.bancor.network',
        icon: <IconTelegram />,
      },
      {
        label: 'Discord',
        to: 'https://x.bancor.network',
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
        to: 'https://x.bancor.network',
        icon: <IconDocument />,
      },
      {
        label: 'GitHub',
        to: 'https://x.bancor.network',
        icon: <IconGithub />,
      },
      {
        label: 'Telegram',
        to: 'https://x.bancor.network',
        icon: <IconTelegram />,
      },
    ],
  },
];

interface MenuSecondaryProps {
  isMinimized: boolean;
}

export const MenuSecondary = ({ isMinimized }: MenuSecondaryProps) => {
  return (
    <>
      <hr className="mx-20" />
      <div className="p-20 text-12 space-y-16">
        {menu.map((item, index) => {
          return (
            <Popover key={index} className="relative">
              <MenuSecondaryItem {...item} />

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
      </div>
    </>
  );
};
