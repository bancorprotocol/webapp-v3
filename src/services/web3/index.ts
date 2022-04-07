import { Web3Provider } from '@ethersproject/providers';
import { EthNetworks } from 'services/web3//types';
import { providers } from 'ethers';
import { buildAlchemyUrl } from 'services/web3/wallet/connectors';
import { isForkAvailable } from './config';

export const getProvider = (
  network: EthNetworks = EthNetworks.Mainnet,
  useFork: boolean = isForkAvailable
): providers.BaseProvider => {
  if (useFork) {
    return new providers.JsonRpcProvider(
      'https://rpc.tenderly.co/fork/2635a185-e6bf-4e4c-809c-ac236a302f74'
    );
  }
  if (process.env.REACT_APP_ALCHEMY_MAINNET) {
    return new providers.WebSocketProvider(buildAlchemyUrl(network));
  }

  return providers.getDefaultProvider(network);
};

export const web3 = {
  provider: getProvider(),
};

export const keepWSOpen = () => {
  if (!(web3.provider instanceof providers.WebSocketProvider)) return;

  setInterval(async () => {
    //Extra check since TS doesnt detect things outside interval
    if (web3.provider instanceof providers.WebSocketProvider) {
      if (
        web3.provider._websocket.readyState === WebSocket.OPEN ||
        web3.provider._websocket.readyState === WebSocket.CONNECTING
      )
        return;

      try {
        web3.provider._websocket.close();
      } catch (error) {
        console.error('Failed closing websocket', error);
      }
      try {
        console.debug('Reconnecting websocket');
        web3.provider = new providers.WebSocketProvider(
          buildAlchemyUrl(EthNetworks.Mainnet)
        );
      } catch (error) {
        console.error('Failed init web3', error);
      }
    }
  }, 7500);
};

export const writeWeb3 = {
  signer: window.ethereum
    ? new Web3Provider(window.ethereum).getSigner()
    : new providers.WebSocketProvider(
        buildAlchemyUrl(EthNetworks.Mainnet)
      ).getSigner(),
};

export const setProvider = (
  provider: providers.WebSocketProvider | providers.BaseProvider
) => {
  web3.provider = provider;
};

export const setSigner = (
  signer?: providers.JsonRpcSigner,
  account?: string | null
) => {
  if (account)
    writeWeb3.signer = new providers.JsonRpcProvider(
      'https://rpc.tenderly.co/fork/2635a185-e6bf-4e4c-809c-ac236a302f74'
    ).getUncheckedSigner(account);
  else if (signer) writeWeb3.signer = signer;
};
