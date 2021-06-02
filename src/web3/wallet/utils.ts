import { Web3Provider } from '@ethersproject/providers';
import { AbstractConnector } from '@web3-react/abstract-connector';
import {
  injected,
  walletconnect,
  walletlink,
  ledger,
  trezor,
  lattice,
  frame,
  fortmatic,
  portis,
  authereum,
  torus,
} from 'web3/wallet/connectors';

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

export const SUPPORTED_WALLETS: WalletInfo[] = [
  {
    connector: injected,
    name: 'MetaMask',
    icon: 'METAMASK_ICON_URL',
    description: 'MetaMask description',
  },
  {
    connector: walletconnect,
    name: 'WalletConnect',
    icon: 'WALLETCONNECT_ICON_URL',
    description: 'WalletConnect description',
    mobile: true,
  },
  {
    connector: walletlink,
    name: 'Coinbase Wallet',
    icon: 'COINBASE_ICON_URL',
    description: 'Coinbase Wallet description',
  },
  {
    connector: ledger,
    name: 'Ledger',
    icon: 'LEDGER_ICON_URL',
    description: 'Ledger description',
  },
  {
    connector: trezor,
    name: 'Trezor',
    icon: 'TREZOR_ICON_URL',
    description: 'Trezor description',
  },
  {
    connector: lattice,
    name: 'Lattice',
    icon: 'LATTICE_ICON_URL',
    description: 'Lattice description',
  },
  {
    connector: frame,
    name: 'Frame',
    icon: 'FRAME_ICON_URL',
    description: 'Frame description',
  },
  {
    name: 'Open in Coinbase Wallet',
    icon: 'COINBASE_ICON_URL',
    description: 'Open in Coinbase Wallet app.',
    href: 'https://go.cb-w.com/mtUDhEZPy1',
    mobile: true,
    mobileOnly: true,
  },
  {
    connector: fortmatic,
    name: 'Fortmatic',
    icon: 'FORTMATIC_ICON_URL',
    description: 'Fortmatic description',
    mobile: true,
  },
  {
    connector: portis,
    name: 'Portis',
    icon: 'PORTIS_ICON_URL',
    description: 'Portis description',
    mobile: true,
  },
  {
    connector: authereum,
    name: 'Authereum',
    icon: 'AUTHEREUM_ICON_URL',
    description: 'Authereum description',
  },
  {
    connector: torus,
    name: 'Torus',
    icon: 'TORUS_ICON_URL',
    description: 'Torus description',
    mobile: true,
  },
];
