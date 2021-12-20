import { FrameConnector } from '@web3-react/frame-connector';
import { PortisConnector } from '@web3-react/portis-connector';
import { InjectedConnector } from '@web3-react/injected-connector';
import { FortmaticConnector } from '@web3-react/fortmatic-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { TorusConnector } from '@web3-react/torus-connector';
import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react';
import { EthNetworks } from 'services/web3/types';

export const buildAlchemyUrl = (network: EthNetworks, wss: boolean = true) => {
  const net = EthNetworks.Mainnet === network ? 'mainnet' : 'ropsten';
  const id =
    network === EthNetworks.Mainnet
      ? (process.env.REACT_APP_ALCHEMY_MAINNET as string)
      : (process.env.REACT_APP_ALCHEMY_ROPSTEN as string);
  return `${wss ? 'wss' : 'https'}://eth-${net}.alchemyapi.io/v2/${id}`;
};

const RPC_URLS: { [chainId: number]: string } = {
  1: buildAlchemyUrl(EthNetworks.Mainnet, false),
  3: buildAlchemyUrl(EthNetworks.Ropsten, false),
};

const appName = 'bancor';

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42],
});

export const gnosisSafe = new SafeAppConnector();

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1], 3: RPC_URLS[3] },
  qrcode: true,
});

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: appName,
});

export const frame = new FrameConnector({ supportedChainIds: [1] });

export const fortmatic = new FortmaticConnector({
  apiKey: process.env.REACT_APP_FORTMATIC_API_KEY as string,
  chainId: 1,
});

export const portis = new PortisConnector({
  dAppId: process.env.REACT_APP_PORTIS_DAPP_ID as string,
  networks: [1, 100],
});

export const torus = new TorusConnector({
  chainId: 1
});
