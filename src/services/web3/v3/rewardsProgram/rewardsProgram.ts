import {
  ProviderStake,
  RewardsProgram,
} from 'redux/portfolio/v3Portfolio.types';
import BigNumber from 'bignumber.js';
import { ethToken } from 'services/web3/config';

const fetchAllProgramsIds = async (): Promise<number[]> => {
  // contracts/staking-rewards/StandardStakingRewards.sol
  // function: programsIds()
  return [1, 2, 3];
};

const fetchProgramsByIds = async (ids: number[]): Promise<RewardsProgram[]> => {
  // contracts/staking-rewards/StandardStakingRewards.sol
  // function: programs()
  return [
    {
      id: 1,
      pool: '123',
      poolToken: '123',
      rewardsToken: ethToken,
      endTime: 123,
      startTime: 123,
      rewardRate: '123',
      isEnabled: true,
    },
  ];
};

export const fetchAllRewardsPrograms = async (): Promise<RewardsProgram[]> => {
  const ids = await fetchAllProgramsIds();
  return await fetchProgramsByIds(ids);
};

const fetchProviderProgramIds = async (user: string): Promise<number[]> => {
  // contracts/staking-rewards/StandardStakingRewards.sol
  // function: providerProgramsIds()
  return [1, 2, 3];
};

const fetchProviderStakeById = async (
  user: string,
  id: number
): Promise<string> => {
  // contracts/staking-rewards/StandardStakingRewards.sol
  // function: providerStake()
  const amount = 123;
  return new BigNumber(amount).toString();
};

export const fetchProviderProgramStakes = async (
  user: string
): Promise<ProviderStake[]> => {
  const ids = await fetchProviderProgramIds(user);
  return await Promise.all(
    ids.map(async (programId) => {
      const amount = await fetchProviderStakeById(user, programId);
      return { programId, amount };
    })
  );
};
