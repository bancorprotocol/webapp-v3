import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { EthNetworks } from 'services/web3//types';
import { provider } from 'services/web3//wallet/connectors';
import { Contract } from 'web3-eth-contract';

export const web3 = new Web3(
  Web3.givenProvider || provider(EthNetworks.Mainnet)
);

export const writeWeb3 = new Web3(Web3.givenProvider);

interface ContractTyped<T> extends Contract {
  methods: T;
}

export const buildContract = <T>(
  abi: AbiItem[],
  contractAddress?: string,
  injectedWeb3?: Web3
): ContractTyped<T> => {
  const contract = contractAddress
    ? new (injectedWeb3 || web3).eth.Contract(abi, contractAddress)
    : new (injectedWeb3 || web3).eth.Contract(abi);

  return contract as unknown as ContractTyped<T>;
};
