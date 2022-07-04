import { FrameConnector } from '@web3-react/frame-connector';
import { PortisConnector } from '@web3-react/portis-connector';
import { InjectedConnector } from '@web3-react/injected-connector';
import { FortmaticConnector } from '@web3-react/fortmatic-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { TorusConnector } from '@web3-react/torus-connector';
import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react';

export const ALCHEMY_URL = `https://eth-mainnet.alchemyapi.io/v2/${
  process.env.REACT_APP_ALCHEMY_MAINNET as string
}`;

const appName = 'bancor';

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42],
});

export const gnosisSafe = new SafeAppConnector();

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: ALCHEMY_URL },
  qrcode: true,
});

export const walletlink = new WalletLinkConnector({
  url: ALCHEMY_URL,
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
  chainId: 1,
});
