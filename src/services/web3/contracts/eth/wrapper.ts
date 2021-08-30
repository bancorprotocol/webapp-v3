import { CallReturn } from 'eth-multicall';
import { ContractMethods } from 'services/web3/types';
import { buildContract, writeWeb3 } from 'services/web3/contracts';
import { ContractSendMethod } from 'web3-eth-contract';
import { ABIWethToken } from './abi';

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

interface WethContractType extends TokenContractType {
  deposit: () => ContractSendMethod;
  withdraw: (amount: string) => ContractSendMethod;
}

export const buildWethContract = (
  contractAddress?: string
): ContractMethods<WethContractType> =>
  buildContract(ABIWethToken, contractAddress, writeWeb3);
