import { CallReturn } from 'eth-multicall';
import { ContractSendMethod } from 'web3-eth-contract';
import { ContractMethods } from 'services/web3/types';
import { shrinkToken } from 'utils/pureFunctions';
import { buildContract } from '..';
import Web3 from 'web3';
import { ABIStakingRewards } from './abi';
import { ProtectedLiquidity } from '../liquidityProtection/wrapper';
import { BigNumber } from 'bignumber.js';

export interface PendingReserveReward {
  poolId: string;
  reserveId: string;
  decBnt: string;
}

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

export const pendingRewardRewards = async (
  stakingRewardsContract: string,
  currentUser: string,
  poolId: string,
  reserveId: string
): Promise<PendingReserveReward> => {
  const contract = buildStakingRewardsContract(stakingRewardsContract);

  const wei = await contract.methods
    .pendingReserveRewards(currentUser, poolId, reserveId)
    .call();
  const decBnt = shrinkToken(wei, 18);

  return {
    poolId,
    reserveId,
    decBnt,
  };
};

export const positionMatchesReward =
  (position: ProtectedLiquidity) => (reward: PendingReserveReward) =>
    position.poolToken === reward.poolId &&
    position.reserveToken === reward.reserveId;

export const fetchRewardsMultiplier = async (
  poolId: string,
  reserveId: string,
  stakingRewardsContract: string,
  currentUser: string
): Promise<BigNumber> => {
  const contract = buildStakingRewardsContract(stakingRewardsContract);
  const result = await contract.methods
    .rewardsMultiplier(currentUser, poolId, reserveId)
    .call();

  return new BigNumber(shrinkToken(result, 6));
};
