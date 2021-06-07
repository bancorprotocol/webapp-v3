import 'elements/layoutHeader/LayoutHeader.css';
import bancorLogo from 'assets/logos/bancor.svg';
import walletIcon from 'assets/icons/wallet.svg';
import bellIcon from 'assets/icons/bell.svg';
import cogIcon from 'assets/icons/cog.svg';
import { useState } from 'react';
import { WalletModal } from 'elements/walletModal/WalletModal';
import { useWeb3React } from '@web3-react/core';
import { setAutoLogin, shortenString } from 'utils/pureFunctions';

export const LayoutHeader = () => {
  const [isWalletOpen, setWalletOpen] = useState(false);
  const { account, deactivate } = useWeb3React();

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
          <a
            href="https://app.bancor.network"
            className="hover:underline text-12 text-primary mr-40"
          >
            <img src={bancorLogo} alt="Bancor Logo" className="h-24" />
            Go back to Bancor V2
          </a>
          <button className="btn-secondary btn-sm">
            <div className="bg-success w-6 h-6 rounded-full mr-10">&#8203;</div>
            Ethereum Mainnet
          </button>
        </div>

        <div className="flex items-center">
          <button
            onClick={connectButton}
            className="btn-outline-secondary btn-sm"
          >
            <img
              src={walletIcon}
              alt="Connect Wallet Icon"
              className="-ml-14 mr-16"
            />
            {account ? shortenString(account) : 'Connect Wallet'}
          </button>

          <WalletModal isOpen={isWalletOpen} setIsOpen={setWalletOpen} />

          <button className="ml-40">
            <img src={bellIcon} alt="Notification Icon" />
          </button>
          <span className="text-grey-3 text-20 mx-16">|</span>
          <button>
            <img src={cogIcon} alt="Settings Icon" />
          </button>
        </div>
      </div>
    </div>
  );
};
