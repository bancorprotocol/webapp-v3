import { CallReturn } from 'eth-multicall';
import { ContractMethods } from 'services/web3/types';
import Web3 from 'web3';
import { buildContract } from '..';
import {
  ABIStakingRewards,
  ABIStakingRewardsStore,
  ABILiquidityProtectionStore,
} from './abi';
import { ContractSendMethod } from 'web3-eth-contract';

export const buildStakingRewardsContract = (
  contractAddress: string,
  web3?: Web3
): ContractMethods<{
  stakeRewards: (maxAmount: string, poolToken: string) => ContractSendMethod;
  claimRewards: () => ContractSendMethod;
  totalClaimedRewards: (provider: string) => CallReturn<string>;
  pendingRewards: (provider: string) => CallReturn<string>;
  store: () => CallReturn<string>;
  pendingReserveRewards: (
    provider: string,
    poolToken: string,
    reserveToken: string
  ) => CallReturn<string>;
  rewardsMultiplier: (
    provider: string,
    poolToken: string,
    reserveToken: string
  ) => CallReturn<string>;
}> => buildContract(ABIStakingRewards, contractAddress, web3);

export const buildStakingRewardsStoreContract = (
  contractAddress: string,
  web3?: Web3
): ContractMethods<{
  poolPrograms: () => CallReturn<{
    '0': string[]; // poolToken
    '1': string[]; // startTimes
    '2': string[]; // endTimes
    '3': string[]; // rewardRates
    '4': string[][]; // reserveTokens
    '5': string[][]; // rewardShares
  }>;
}> => buildContract(ABIStakingRewardsStore, contractAddress, web3);

export const buildLiquidityProtectionStoreContract = (
  contractAddress: string,
  web3?: Web3
): ContractMethods<{
  lockedBalanceCount(owner: string): CallReturn<string>;
  lockedBalance(
    owner: string,
    index: string
  ): CallReturn<{ '0': string; '1': string }>;
  lockedBalanceRange(
    owner: string,
    startIndex: string,
    endIndex: string
  ): CallReturn<{ '0': string[]; '1': string[] }>;
  systemBalance(tokenAddress: string): CallReturn<string>;
  totalProtectedPoolAmount(poolTokenAddress: string): CallReturn<string>;
  totalProtectedReserveAmount(
    anchorAddress: string,
    reserveAddress: string
  ): CallReturn<string>;
  protectedLiquidityCount(owner: string): CallReturn<string>;
  protectedLiquidityIds(owner: string): CallReturn<string[]>;
  protectedLiquidityId(owner: string): CallReturn<string>;
  protectedLiquidity(id: string): CallReturn<{ [key: string]: string }>;
}> => buildContract(ABILiquidityProtectionStore, contractAddress, web3);
