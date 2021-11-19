import { Web3Provider } from '@ethersproject/providers';
import { Contract, ContractInterface } from '@ethersproject/contracts';
import { EthNetworks } from 'services/web3//types';
import { providers, Signer } from 'ethers';
import { buildAlchemyUrl } from 'services/web3/wallet/connectors';

const getProvider = () => {
  if (process.env.REACT_APP_ALCHEMY_MAINNET) {
    return new providers.WebSocketProvider(
      buildAlchemyUrl(EthNetworks.Mainnet)
    );
  } else {
    return providers.getDefaultProvider(EthNetworks.Mainnet);
  }
};

export const web3 = {
  provider: getProvider(),
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
