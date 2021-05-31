import { Web3Provider } from '@ethersproject/providers';
import { AbstractConnector } from '@web3-react/abstract-connector';
import {
  //fortmatic,
  injected,
  //portis,
  walletconnect,
  walletlink,
} from 'web3/connectors';

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
  description: string;
  icon: string;
  href?: string;
  mobile?: true;
  mobileOnly?: true;
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    icon: 'INJECTED_ICON_URL',
    description: 'Injected web3 provider.',
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    icon: 'METAMASK_ICON_URL',
    description: 'MetaMask description',
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    icon: 'WALLETCONNECT_ICON_URL',
    description: 'WalletConnect description',
    mobile: true,
  },
  WALLET_LINK: {
    connector: walletlink,
    name: 'Coinbase Wallet',
    icon: 'COINBASE_ICON_URL',
    description: 'Coinbase Wallet description',
  },
  COINBASE_LINK: {
    name: 'Open in Coinbase Wallet',
    icon: 'COINBASE_ICON_URL',
    description: 'Open in Coinbase Wallet app.',
    href: 'https://go.cb-w.com/mtUDhEZPy1',
    mobile: true,
    mobileOnly: true,
  },
  // FORTMATIC: {
  //   connector: fortmatic,
  //   name: 'Fortmatic',
  //   icon: 'FORTMATIC_ICON_URL',
  //   description: 'Login using Fortmatic hosted wallet',
  //   mobile: true,
  // },
  // Portis: {
  //   connector: portis,
  //   name: 'Portis',
  //   icon: 'PORTIS_ICON_URL',
  //   description: 'Login using Portis hosted wallet',
  //   mobile: true,
  // },
};
