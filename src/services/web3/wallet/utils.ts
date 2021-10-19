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
} from 'services/web3/wallet/connectors';

import metamaskLogo from 'assets/logos/metamask.png';
import fortmaticLogo from 'assets/logos/fortmatic.svg';
import portisLogo from 'assets/logos/portis.png';
import walletConnectLogo from 'assets/logos/walletConnect.svg';
import coinbaseWalletLogo from 'assets/logos/coinbaseWallet.svg';
import ledgerLogo from 'assets/logos/ledger.svg';
import trezorLogo from 'assets/logos/trezor.svg';
import frameLogo from 'assets/logos/frame.png';
import lattisLogo from 'assets/logos/lattis.png';
import torusLogo from 'assets/logos/torus.svg';
import gnosisSafeLogo from 'assets/logos/gnosisSafe.svg';

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
  connector: AbstractConnector;
  name: string;
  icon: string;
}

export const SUPPORTED_WALLETS: WalletInfo[] = [
  {
    connector: injected,
    name: 'MetaMask',
    icon: metamaskLogo,
  },
  {
    connector: walletconnect,
    name: 'WalletConnect',
    icon: walletConnectLogo,
  },
  {
    connector: walletlink,
    name: 'Coinbase Wallet',
    icon: coinbaseWalletLogo,
  },
  {
    connector: injected,
    name: 'Ledger',
    icon: ledgerLogo,
  },
  {
    connector: injected,
    name: 'Trezor',
    icon: trezorLogo,
  },
  {
    connector: gnosisSafe,
    name: 'GnosisSafe',
    icon: gnosisSafeLogo,
  },
  {
    connector: injected,
    name: 'Lattice',
    icon: lattisLogo,
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
  },
  {
    connector: portis,
    name: 'Portis',
    icon: portisLogo,
  },
  {
    connector: injected,
    name: 'Torus',
    icon: torusLogo,
  },
];
