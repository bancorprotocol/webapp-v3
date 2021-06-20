import BigNumber from 'bignumber.js';
import { CallReturn } from 'eth-multicall';
import { current } from 'immer';
import Web3 from 'web3';
import { ContractSendMethod } from 'web3-eth-contract';
import { ContractMethods } from 'web3/types';
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

export const approvedStatus = async (
  owner: string,
  spender: string,
  weiAmount: string,
  tokenAddress: string
): Promise<{
  isApprovalRequired: boolean;
  currentApprovedBalance: string;
}> => {
  const tokenContract = buildTokenContract(tokenAddress, web3);
  const currentApprovedBalance = await tokenContract.methods
    .allowance(owner, spender)
    .call();

  const sufficientBalanceAlreadyApproved = new BigNumber(
    currentApprovedBalance
  ).isGreaterThanOrEqualTo(weiAmount);

  return {
    isApprovalRequired: !sufficientBalanceAlreadyApproved,
    currentApprovedBalance,
  };
};
