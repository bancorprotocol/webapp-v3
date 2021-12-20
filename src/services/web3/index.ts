import { Web3Provider } from '@ethersproject/providers';
import { EthNetworks } from 'services/web3//types';
import { providers } from 'ethers';
import { buildAlchemyUrl } from 'services/web3/wallet/connectors';
import { currentNetwork$ } from 'services/observables/network';
import { take } from 'rxjs/operators';

export const getProvider = (
  network: EthNetworks = EthNetworks.Mainnet
): providers.WebSocketProvider | providers.BaseProvider => {
  if (process.env.REACT_APP_ALCHEMY_MAINNET)
    return new providers.WebSocketProvider(buildAlchemyUrl(network));

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
        const network = await currentNetwork$.pipe(take(1)).toPromise();
        web3.provider = new providers.WebSocketProvider(
          buildAlchemyUrl(network)
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

export const setSigner = (signer: providers.JsonRpcSigner) => {
  writeWeb3.signer = signer;
};
