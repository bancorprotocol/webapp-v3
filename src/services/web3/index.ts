import { Web3Provider } from '@ethersproject/providers';
import { Contract, ContractInterface } from '@ethersproject/contracts';
import { EthNetworks } from 'services/web3//types';
import { providers, Signer } from 'ethers';
import { buildAlchemyUrl } from 'services/web3/wallet/connectors';
import { currentNetwork$ } from 'services/observables/network';
import { take } from 'rxjs/operators';

export const web3 = {
  provider: new providers.WebSocketProvider(
    buildAlchemyUrl(EthNetworks.Mainnet)
  ),
};

export const keepWSOpen = () => {
  setInterval(async () => {
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
      const network = await currentNetwork$.pipe(take(1)).toPromise();
      web3.provider = new providers.WebSocketProvider(buildAlchemyUrl(network));
    } catch (error) {
      console.error('Failed init web3', error);
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

export const setProvider = (provider: providers.WebSocketProvider) => {
  web3.provider = provider;
};

export const setSigner = (signer: providers.JsonRpcSigner) => {
  writeWeb3.signer = signer;
};

export const buildContract = (
  abi: ContractInterface,
  contractAddress: string,
  injectedWeb3?: Web3Provider | Signer
) => new Contract(contractAddress, abi, injectedWeb3 || web3.provider);
