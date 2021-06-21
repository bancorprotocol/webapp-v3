import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

export const web3 = new Web3(Web3.givenProvider);

export const buildContract = (
  abi: AbiItem[],
  contractAddress?: string,
  injectedWeb3?: Web3
) =>
  contractAddress
    ? new (injectedWeb3 || web3).eth.Contract(abi, contractAddress)
    : new (injectedWeb3 || web3).eth.Contract(abi);
