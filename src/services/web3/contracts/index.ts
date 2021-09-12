import { Web3Provider } from '@ethersproject/providers';
import { Contract, ContractInterface } from '@ethersproject/contracts';
import { EthNetworks } from 'services/web3//types';
import { Signer } from 'ethers';
import { buildAlchemyUrl } from '../wallet/connectors';

export const web3 = new Web3Provider(
  window.ethereum || buildAlchemyUrl(EthNetworks.Mainnet)
);

export const writeWeb3 = new Web3Provider(window.ethereum);

export const buildContract = (
  abi: ContractInterface,
  contractAddress: string,
  injectedWeb3?: Web3Provider | Signer
) => new Contract(contractAddress, abi, injectedWeb3 || web3);
