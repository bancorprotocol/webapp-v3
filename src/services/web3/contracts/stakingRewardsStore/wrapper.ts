import Web3 from 'web3';
import { CallReturn } from 'eth-multicall';
import { ContractMethods } from 'services/web3/types';
import { ABIStakingRewardsStore } from './abi';
import { buildContract } from '..';
import { zip } from 'lodash';

interface RewardShare {
  reserveId: string;
  rewardShare: string;
}

export interface PoolProgram {
  poolToken: string;
  startTimes: string;
  endTimes: string;
  rewardRate: string;
  reserves: RewardShare[];
}

export const buildStakingRewardsStoreContract = (
  contractAddress: string,
  web3?: Web3
): ContractMethods<{
  poolPrograms: () => CallReturn<{
    '0': string[]; // Pool Token
    '1': string[]; // Start Times
    '2': string[]; // End Times
    '3': string[]; // Reward Rates
    '4': string[][]; // Reserve Tokens
    '5': string[][]; // Reward Shares
  }>;
}> => buildContract(ABIStakingRewardsStore, contractAddress, web3);

export const fetchPoolPrograms = async (
  rewardStoreContract: string
): Promise<PoolProgram[]> => {
  const store = buildStakingRewardsStoreContract(rewardStoreContract);

  const result = await store.methods.poolPrograms().call();

  const poolPrograms: PoolProgram[] = [];

  for (let i = 0; i < result[0].length; i++) {
    const reserveTokens = result[4][i];
    const rewardShares = result[5][i];
    const reserves = (
      zip(reserveTokens, rewardShares) as [string, string][]
    ).map(
      ([reserveId, rewardShare]): RewardShare => ({ reserveId, rewardShare })
    );

    poolPrograms.push({
      poolToken: result[0][i],
      startTimes: result[1][i],
      endTimes: result[2][i],
      rewardRate: result[3][i],
      reserves,
    });
  }

  return poolPrograms;
};
