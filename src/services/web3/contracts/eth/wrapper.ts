import { CallReturn } from 'eth-multicall';
import { ContractMethods } from 'services/web3/types';
import Web3 from 'web3';
import { buildContract } from '..';
import { ABIBancorGovernance } from '../governance/abi';
import { Proposal } from '../governance/wrapper';
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
  contractAddress?: string,
  web3?: Web3
): ContractMethods<WethContractType> =>
  buildContract(ABIWethToken, contractAddress, web3);

export const buildGovernanceContract = (
  contractAddress?: string,
  web3?: Web3
): ContractMethods<{
  voteDuration: () => CallReturn<string>;
  voteLockDuration: () => CallReturn<string>;
  voteLockFraction: () => CallReturn<string>;
  newProposalMinimum: () => CallReturn<string>;
  propose: (executor: string, hash: string) => ContractSendMethod;
  voteFor: (proposalId: string) => ContractSendMethod;
  voteAgainst: (proposalId: string) => ContractSendMethod;
  stake: (amount: string) => ContractSendMethod;
  unstake: (amount: string) => ContractSendMethod;
  decimals: () => CallReturn<string>;
  proposalCount: () => CallReturn<number>;
  proposals: (proposalI: number) => CallReturn<Proposal>;
  votesOf: (voter: string) => CallReturn<string>;
  votesForOf: (voter: string, proposalId: number) => CallReturn<string>;
  votesAgainstOf: (voter: string, proposalId: number) => CallReturn<string>;
  voteLocks: (voter: string) => CallReturn<string>;
  govToken: () => CallReturn<string>;
}> => buildContract(ABIBancorGovernance, contractAddress, web3);
