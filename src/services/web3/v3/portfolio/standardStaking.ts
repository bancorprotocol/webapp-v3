import { ContractsApi } from 'services/web3/v3/contractsApi';
import { multicall, MultiCall } from 'services/web3/multicall/multicall';
import { BigNumber } from 'ethers';

export const buildProviderStakeCall = (
  id: BigNumber,
  user: string
): MultiCall => {
  const contract = ContractsApi.StandardStakingRewards.read;

  return {
    contractAddress: contract.address,
    interface: contract.interface,
    methodName: 'providerStake',
    methodParameters: [user, id],
  };
};

export interface RewardsProgramStake {
  rewardRate: string;
  poolTokenAmountWei: string;
  tokenAmountWei: string;
  isEnabled: boolean;
  pool: string;
  poolToken: string;
  startTime: number;
  id: string;
  rewardsToken: string;
  pendingRewardsWei: string;
  endTime: number;
}

export const fetchStandardRewardsByUser = async (
  user: string
): Promise<RewardsProgramStake[]> => {
  try {
    const ids =
      await ContractsApi.StandardStakingRewards.read.providerProgramIds(user);

    const calls = ids.map((id) => buildProviderStakeCall(id, user));
    const res = await multicall(calls);
    if (!res) {
      throw new Error('Multicall Error while fetching provider stake');
    }
    const poolTokenStakedWei = new Map(
      res.map((bn, idx) => [
        ids[idx].toString(),
        bn && bn.length ? (bn[0].toString() as string) : '0',
      ])
    );
    const programs = await ContractsApi.StandardStakingRewards.read.programs(
      ids
    );

    return await Promise.all(
      programs.map(async (program) => {
        const poolTokenAmountWei =
          poolTokenStakedWei.get(program.id.toString()) || '0';
        const tokenAmountWei =
          await ContractsApi.PoolCollection.read.poolTokenToUnderlying(
            program.pool,
            poolTokenAmountWei
          );
        const pendingRewardsWei =
          await ContractsApi.StandardStakingRewards.read.pendingRewards(user, [
            program.id,
          ]);

        return {
          rewardRate: program.rewardRate.toString(),
          isEnabled: program.isEnabled,
          pool: program.pool,
          poolToken: program.poolToken,
          startTime: program.startTime,
          id: program.id.toString(),
          rewardsToken: program.rewardsToken,
          pendingRewardsWei: pendingRewardsWei.toString(),
          endTime: program.endTime,
          poolTokenAmountWei,
          tokenAmountWei: tokenAmountWei.toString(),
        };
      })
    );
  } catch (e) {
    console.error(e);
    throw e;
  }
};
