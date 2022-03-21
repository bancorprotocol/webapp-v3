import { ProviderStake } from 'redux/portfolio/v3Portfolio.types';
import { ProgramDataStructOutput } from 'services/web3/abis/types/StandardStakingRewardsV3';
import { ContractsApi } from 'services/web3/v3/contractsApi';

export const fetchAllRewardsPrograms = async (): Promise<
  ProgramDataStructOutput[]
> => {
  try {
    const ids = await ContractsApi.StandardStakingRewards.read.programsIds();
    return await ContractsApi.StandardStakingRewards.read.programs(ids);
  } catch (e) {
    console.error('failed to fetchAllRewardsPrograms', e);
    throw e;
  }
};

export const fetchProviderProgramStakes = async (
  user: string
): Promise<ProviderStake[]> => {
  try {
    const ids =
      await ContractsApi.StandardStakingRewards.read.providerProgramIds(user);
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
  } catch (e) {
    console.error('failed to fetchProviderProgramStakes', e);
    throw e;
  }
};
