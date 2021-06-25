import 'elements/layoutHeader/LayoutHeader.css';
import { ReactComponent as IconWallet } from 'assets/icons/wallet.svg';
import { useState } from 'react';
import { WalletModal } from 'elements/walletModal/WalletModal';
import { useWeb3React } from '@web3-react/core';
import {
  getNetworkName,
  setAutoLogin,
  shortenString,
} from 'utils/pureFunctions';
import { EthNetworks } from 'web3/types';
import { FormattedMessage } from 'react-intl';
import { NotificationsMenu } from 'elements/layoutHeader/notificationsMenu/NotificationsMenu';
import { SettingsMenu } from 'elements/layoutHeader/settingsMenu/SettingsMenu';

export const LayoutHeader = () => {
  const [isWalletOpen, setWalletOpen] = useState(false);
  const { account, deactivate, chainId } = useWeb3React();

  const connectButton = () => {
    if (account) {
      deactivate();
      setAutoLogin(false);
    } else setWalletOpen(true);
  };

  return (
    <div className="layout-header">
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
          <button
            onClick={connectButton}
            className="btn-outline-secondary btn-sm mr-40"
          >
            <IconWallet className="-ml-14 mr-16 text-primary dark:text-primary-light w-[22px]" />

            {account ? (
              shortenString(account)
            ) : (
              <FormattedMessage id="connect_wallet" />
            )}
          </button>
          <WalletModal isOpen={isWalletOpen} setIsOpen={setWalletOpen} />
          <NotificationsMenu />
          <span className="text-grey-3 text-20 mx-16">|</span>
          <SettingsMenu />
        </div>
      </div>
    </div>
  );
};
