import { useWeb3React } from '@web3-react/core';
import { EthNetworks } from 'services/web3/types';
import { NotificationsMenu } from 'elements/notifications/NotificationsMenu';
import { SettingsMenu } from 'elements/settings/SettingsMenu';
import { LayoutHeaderMobile } from 'elements/layoutHeader/LayoutHeaderMobile';
import { ReactComponent as IconHamburger } from 'assets/icons/hamburger.svg';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { ReactComponent as IconBancorv3 } from 'assets/logos/bancorv3.svg';
import { ReactComponent as IconSlogan } from 'assets/logos/discoverDefiSlogan.svg';
import 'elements/layoutHeader/LayoutHeader.css';
import { getNetworkName } from 'utils/helperFunctions';
import { useWalletConnect } from '../walletConnect/useWalletConnect';
import { WalletConnectModal } from '../walletConnect/WalletConnectModal';
import { WalletConnectButton } from '../walletConnect/WalletConnectButton';
import { useAppSelector } from '../../redux';
import { useDispatch } from 'react-redux';
import { setShowBanner } from '../../redux/user/user';

interface LayoutHeaderProps {
  isMinimized: boolean;
  setIsSidebarOpen: Function;
}

export const LayoutHeader = ({
  isMinimized,
  setIsSidebarOpen,
}: LayoutHeaderProps) => {
  const { chainId } = useWeb3React();
  const wallet = useWalletConnect();
  const showBanner = useAppSelector<boolean>((state) => state.user.showBanner);
  const dispatch = useDispatch();
  const handleCloseBanner = () => {
    dispatch(setShowBanner(false));
  };
  return (
    <>
      <header className={`layout-header ${showBanner ? 'h-[140px]' : 'h-60'}`}>
        {showBanner && (
          <div className="flex justify-center items-center bg-blue-4 border-b border-[#5D687A] w-full absolute top-0 h-[80px] text-white">
            <button
              className="absolute right-20 p-10"
              onClick={() => handleCloseBanner()}
            >
              <IconTimes className="w-16" />
            </button>
            <IconBancorv3 className="mr-20" />
            <IconSlogan />
          </div>
        )}

        <div
          className={`transition-all duration-500 ${
            isMinimized ? 'ml-[96px]' : 'ml-[230px]'
          } mr-30 w-full`}
        >
          <div
            className={`layout-header-content ${
              showBanner ? 'relative top-[40px]' : ''
            } `}
          >
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
              <WalletConnectButton {...wallet} />
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
          <WalletConnectButton {...wallet} />
        </div>
      </LayoutHeaderMobile>
      <WalletConnectModal {...wallet} />
    </>
  );
};
