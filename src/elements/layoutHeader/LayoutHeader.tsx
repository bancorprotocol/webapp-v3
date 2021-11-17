import { WalletModal } from 'elements/walletModal/WalletModal';
import { useWeb3React } from '@web3-react/core';
import { EthNetworks } from 'services/web3/types';
import { NotificationsMenu } from 'elements/notifications/NotificationsMenu';
import { SettingsMenu } from 'elements/settings/SettingsMenu';
import { LayoutHeaderMobile } from 'elements/layoutHeader/LayoutHeaderMobile';
import { ReactComponent as IconHamburger } from 'assets/icons/hamburger.svg';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import { isMobile } from 'react-device-detect';
import 'elements/layoutHeader/LayoutHeader.css';
import { getNetworkName } from 'utils/helperFunctions';

interface LayoutHeaderProps {
  isMinimized: boolean;
  setIsSidebarOpen: Function;
}

export const LayoutHeader = ({
  isMinimized,
  setIsSidebarOpen,
}: LayoutHeaderProps) => {
  const { chainId } = useWeb3React();

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
              <button className="btn-secondary btn-sm">
                <div
                  className={`${
                    !chainId || chainId === EthNetworks.Mainnet
                      ? 'bg-success'
                      : chainId === EthNetworks.Ropsten
                      ? 'bg-error'
                      : 'bg-warning'
                  } w-6 h-6 rounded-full mr-10`}
                />
                {getNetworkName(chainId ? chainId : EthNetworks.Mainnet)}
              </button>
            </div>

            <div className="flex items-center">
              <WalletModal isMobile={false} />
              <NotificationsMenu />
              <span className="text-grey-3 text-20 mx-16">|</span>
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
          <div className="bg-grey-4 w-[1px] h-30 mx-10" />
          {isMobile && <WalletModal isMobile={true} />}
        </div>
      </LayoutHeaderMobile>
    </>
  );
};
