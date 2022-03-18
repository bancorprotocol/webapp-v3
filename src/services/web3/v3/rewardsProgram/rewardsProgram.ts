import { ProviderStake } from 'redux/portfolio/v3Portfolio.types';
import { contractsApi } from 'services/web3/v3/index';
import { ProgramDataStructOutput } from 'services/web3/abis/types/StandardStakingRewardsV1';

export const fetchAllRewardsPrograms = async (): Promise<
  ProgramDataStructOutput[]
> => {
  const ids = await contractsApi.StandardStakingRewardsV1.read.programsIds();
  return await contractsApi.StandardStakingRewardsV1.read.programs(ids);
};

export const fetchProviderProgramStakes = async (
  user: string
): Promise<ProviderStake[]> => {
  const ids =
    await contractsApi.StandardStakingRewardsV1.read.providerProgramIds(user);
  return await Promise.all(
    ids.map(async (programId) => {
      const amount =
        await contractsApi.StandardStakingRewardsV1.read.providerStake(
          user,
          programId
        );
      return { programId, amount };
    })
  );
};
