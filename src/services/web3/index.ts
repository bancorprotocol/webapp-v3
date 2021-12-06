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
  expectedPongBack = 15000,
  checkInterval = 7500
) => {
  let pingTimeout: NodeJS.Timeout | null = null;
  let keepAliveInterval: NodeJS.Timeout | null = null;

  provider.on('open', () => {
    keepAliveInterval = setInterval(() => {
      provider._websocket.ping();

      pingTimeout = setTimeout(() => {
        provider._websocket.terminate();
      }, expectedPongBack);
    }, checkInterval);
  });

  provider.on('close', (err: any) => {
    if (keepAliveInterval) clearInterval(keepAliveInterval);
    if (pingTimeout) clearTimeout(pingTimeout);
    onDisconnect(err);
  });

  provider.on('pong', () => {
    if (pingTimeout) clearInterval(pingTimeout);
  });
};
