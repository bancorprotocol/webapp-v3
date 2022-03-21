import { ProviderStake } from 'redux/portfolio/v3Portfolio.types';
import { ProgramDataStructOutput } from 'services/web3/abis/types/StandardStakingRewardsV3';
import { ContractsApi } from 'services/web3/v3/contractsApi';

export const fetchAllRewardsPrograms = async (): Promise<
  ProgramDataStructOutput[]
> => {
  try {
    console.log('fetchAllRewardsPrograms');
    const ids = await ContractsApi.StandardStakingRewards.read.programsIds();
    console.log('ids', ids);
    return await ContractsApi.StandardStakingRewards.read.programs(ids);
  } catch (e) {
    console.error('failed to fetchAllRewardsPrograms', e);
    throw e;
  }
};

export const fetchProviderProgramStakes = async (
  user: string
): Promise<ProviderStake[]> => {
  const ids = await ContractsApi.StandardStakingRewards.read.providerProgramIds(
    user
  );
  return await Promise.all(
    ids.map(async (programId) => {
      const amount =
        await ContractsApi.StandardStakingRewards.read.providerStake(
          user,
          programId
        );
      return { programId, amount };
    })
  );
};
