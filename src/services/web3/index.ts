import { Web3Provider } from '@ethersproject/providers';
import { Contract, ContractInterface } from '@ethersproject/contracts';
import { EthNetworks } from 'services/web3//types';
import { providers, Signer } from 'ethers';
import { buildAlchemyUrl } from 'services/web3/wallet/connectors';

export const web3 = {
  provider: new providers.WebSocketProvider(
    buildAlchemyUrl(EthNetworks.Mainnet)
  ),
};

export const keepWSOpen = () => {
  keepAlive(web3.provider, (err) => {
    keepWSOpen();
    console.error('Web Socket Closed', JSON.stringify(err, null, 2));
  });
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

const keepAlive = (
  provider: providers.WebSocketProvider,
  onDisconnect: (err: any) => void,
  checkInterval = 7500
) => {
  let pingTimeout: NodeJS.Timeout | null = null;
  let keepAliveInterval: NodeJS.Timeout | null = null;

  provider._websocket.onopen = () => {
    keepAliveInterval = setInterval(() => {
      if (
        provider._websocket.readyState === WebSocket.OPEN ||
        provider._websocket.readyState === WebSocket.CONNECTING
      )
        return;

      provider._websocket.close();
    }, checkInterval);
  };

  provider._websocket.onclose = (err: any) => onError(err);
  provider._websocket.onerror = (err: any) => onError(err);

  const onError = (err: any) => {
    if (keepAliveInterval) clearInterval(keepAliveInterval);
    if (pingTimeout) clearTimeout(pingTimeout);
    onDisconnect(err);
  };
};
