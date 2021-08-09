import Web3 from 'web3';
import { CallReturn } from 'eth-multicall';
import { ContractSendMethod } from 'web3-eth-contract';
import { ContractMethods } from 'services/web3/types';
import { buildContract, web3 } from '..';
import { ABISmartToken } from './abi';
interface TokenContractType {
  symbol: () => CallReturn<string>;
  decimals: () => CallReturn<string>;
  owner: () => CallReturn<string>;
  totalSupply: () => CallReturn<string>;
  allowance: (owner: string, spender: string) => CallReturn<string>;
  balanceOf: (owner: string) => CallReturn<string>;
  transferOwnership: (converterAddress: string) => ContractSendMethod;
  issue: (address: string, wei: string) => ContractSendMethod;
  transfer: (to: string, weiAmount: string) => ContractSendMethod;
  approve: (
    approvedAddress: string,
    approvedAmount: string
  ) => ContractSendMethod;
}

export const buildTokenContract = (
  contractAddress: string,
  web3: Web3
): ContractMethods<TokenContractType> =>
  buildContract(ABISmartToken, contractAddress, web3);

export const fetchTokenSupply = async (
  tokenAddress: string,
  blockHeight?: number
) => {
  const smartTokenContract = buildTokenContract(tokenAddress, web3);
  return smartTokenContract.methods.totalSupply().call(undefined, blockHeight);
};

export const fetchPoolOwner = async (anchor: string, blockHeight?: number) => {
  const contract = buildTokenContract(anchor, web3);
  return contract.methods.owner().call(undefined, blockHeight);
};
