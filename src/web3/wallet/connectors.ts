import { FrameConnector } from '@web3-react/frame-connector';
import { TorusConnector } from '@web3-react/torus-connector';
import { LedgerConnector } from '@web3-react/ledger-connector';
import { TrezorConnector } from '@web3-react/trezor-connector';
import { PortisConnector } from '@web3-react/portis-connector';
import { NetworkConnector } from '@web3-react/network-connector';
import { LatticeConnector } from '@web3-react/lattice-connector';
import { InjectedConnector } from '@web3-react/injected-connector';
import { FortmaticConnector } from '@web3-react/fortmatic-connector';
import { AuthereumConnector } from '@web3-react/authereum-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { EthNetworks } from 'web3/types';
import Web3 from 'web3';

const POLLING_INTERVAL = 15000;

const buildAlchemyUrl = (network: EthNetworks, wss: boolean = false) => {
  const net = EthNetworks.Mainnet === network ? 'mainnet' : 'ropstan';
  const id =
    network === EthNetworks.Mainnet
      ? (process.env.REACT_APP_ALCHEMY_MAINNET as string)
      : (process.env.REACT_APP_ALCHEMY_ROPSTEN as string);
  return `${wss ? 'wss' : 'https'}://eth-${net}${
    wss ? '.ws' : ''
  }.alchemyapi.io/v2/${id}`;
};

const RPC_URLS: { [chainId: number]: string } = {
  1: buildAlchemyUrl(EthNetworks.Mainnet),
  3: buildAlchemyUrl(EthNetworks.Ropsten),
};

const appName = 'phoenix';

export const provider = new Web3.providers.WebsocketProvider(
  buildAlchemyUrl(EthNetworks.Mainnet, true),
  {
    timeout: 100 * 1000,
    clientConfig: {
      keepalive: true,
      keepaliveInterval: 60000,
    },
    reconnect: {
      auto: true,
      delay: 15000,
      onTimeout: true,
    },
  }
);

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42],
});

export const network = new NetworkConnector({
  urls: { 1: RPC_URLS[1], 3: RPC_URLS[3] },
  defaultChainId: 1,
});

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1], 3: RPC_URLS[3] },
  qrcode: true,
  pollingInterval: POLLING_INTERVAL,
});

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: appName,
});

export const ledger = new LedgerConnector({
  chainId: 1,
  url: RPC_URLS[1],
  pollingInterval: POLLING_INTERVAL,
});

export const trezor = new TrezorConnector({
  chainId: 1,
  url: RPC_URLS[1],
  pollingInterval: POLLING_INTERVAL,
  manifestEmail: '',
  manifestAppUrl: '',
});

export const lattice = new LatticeConnector({
  chainId: 4,
  appName: appName,
  url: RPC_URLS[3],
});

export const frame = new FrameConnector({ supportedChainIds: [1] });

export const authereum = new AuthereumConnector({ chainId: 42 });

export const fortmatic = new FortmaticConnector({
  apiKey: process.env.REACT_APP_FORTMATIC_API_KEY as string,
  chainId: 4,
});

export const portis = new PortisConnector({
  dAppId: process.env.REACT_APP_PORTIS_DAPP_ID as string,
  networks: [1, 100],
});

export const torus = new TorusConnector({ chainId: 1 });
