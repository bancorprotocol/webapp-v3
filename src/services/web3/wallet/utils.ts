import { Web3Provider } from '@ethersproject/providers';
import { AbstractConnector } from '@web3-react/abstract-connector';
import {
  injected,
  walletconnect,
  walletlink,
  frame,
  fortmatic,
  portis,
  gnosisSafe,
  torus,
} from 'services/web3/wallet/connectors';

import metamaskLogo from 'assets/logos/metamask.png';
import fortmaticLogo from 'assets/logos/fortmatic.svg';
import portisLogo from 'assets/logos/portis.png';
import walletConnectLogo from 'assets/logos/walletConnect.svg';
import coinbaseWalletLogo from 'assets/logos/coinbaseWallet.svg';
import ledgerLogo from 'assets/logos/ledger.svg';
import trezorLogo from 'assets/logos/trezor.svg';
import frameLogo from 'assets/logos/frame.png';
import gnosisSafeLogo from 'assets/logos/gnosisSafe.svg';
import torusLogo from 'assets/logos/torus.svg';
import imposterLogo from 'assets/logos/imposter.svg';
import { isForkAvailable } from '../config';
import { isMobile } from 'react-device-detect';

export const getLibrary = (provider: any): Web3Provider => {
  const library = new Web3Provider(
    provider,
    typeof provider.chainId === 'string'
      ? parseInt(provider.chainId)
      : typeof provider.chainId === 'number'
      ? provider.chainId
      : 'any'
  );
  library.pollingInterval = 15000;
  return library;
};

export interface WalletInfo {
  connector?: AbstractConnector;
  name: string;
  icon: string;
  mobile?: boolean;
  url?: string;
  canAutoConnect?: boolean;
}

export const [isMetaMaskMobile, isCoinbaseMobile] =
  (function checkMobileWallets() {
    let isMetaMaskMobile = false;
    let isCoinbaseMobile = false;
    if (isMobile && window.ethereum) {
      if (window.ethereum.isMetaMask) {
        isMetaMaskMobile = true;
      }

      if (window.ethereum.isCoinbaseWallet) {
        isCoinbaseMobile = true;
      } else if (window.ethereum.providers?.length) {
        window.ethereum.providers.forEach((p: any) => {
          if (p.isMetaMask) isMetaMaskMobile = true;
          if (p.isCoinbaseWallet) isCoinbaseMobile = true;
        });
      }
    }
    return [isMetaMaskMobile, isCoinbaseMobile];
  })();

export const SUPPORTED_WALLETS: WalletInfo[] = [
  {
    connector: injected,
    name: 'MetaMask',
    icon: metamaskLogo,
    mobile: true,
    canAutoConnect: isMetaMaskMobile || isCoinbaseMobile,
  },
  ...(isForkAvailable
    ? [
        {
          connector: injected,
          name: 'Imposter',
          icon: imposterLogo,
          mobile: true,
        },
      ]
    : []),
  {
    connector: walletconnect,
    name: 'WalletConnect',
    icon: walletConnectLogo,
    mobile: true,
  },
  {
    connector: walletlink,
    name: 'Coinbase Wallet',
    icon: coinbaseWalletLogo,
    mobile: true,
    // canAutoConnect: isCoinbaseMobile,
  },
  {
    name: 'Ledger',
    icon: ledgerLogo,
    url: 'https://www.ledger.com/academy/security/the-safest-way-to-use-metamask',
  },
  {
    name: 'Trezor',
    icon: trezorLogo,
    url: 'https://wiki.trezor.io/Apps:MetaMask',
  },
  {
    connector: gnosisSafe,
    name: 'GnosisSafe',
    icon: gnosisSafeLogo,
  },
  {
    connector: frame,
    name: 'Frame',
    icon: frameLogo,
  },
  {
    connector: fortmatic,
    name: 'Fortmatic',
    icon: fortmaticLogo,
    mobile: true,
  },
  {
    connector: portis,
    name: 'Portis',
    icon: portisLogo,
  },
  {
    connector: torus,
    name: 'Torus',
    icon: torusLogo,
  },
];
