import { ContractsApi } from 'services/web3/v3/contractsApi';
import { multicall, MultiCall } from 'services/web3/multicall/multicall';
import { BigNumber } from 'ethers';
import { Token } from 'services/observables/tokens';
import { PoolV3 } from 'services/observables/pools';
import dayjs from 'dayjs';
import { APIPoolV3 } from 'services/api/bancorApi/bancorApi.types';

export const buildProviderStakeCall = (
  id: BigNumber,
  user: string
): MultiCall => {
  const contract = ContractsApi.StandardRewards.read;

  return {
    contractAddress: contract.address,
    interface: contract.interface,
    methodName: 'providerStake',
    methodParameters: [user, id],
  };
};

export interface RewardsProgramStake {
  id: string;
  poolDltId: string;
  poolTokenAmountWei: string;
  tokenAmountWei: string;
  rewardsToken: Token;
  pendingRewardsWei: string;
}

export const fetchStandardRewardsByUser = async (
  user: string,
  pools: PoolV3[]
): Promise<RewardsProgramStake[]> => {
  const poolsMap = new Map(pools.map((pool) => [pool.poolDltId, pool]));
  const allPrograms = pools.flatMap((p) => p.programs);

  try {
    const ids = await ContractsApi.StandardRewards.read.providerProgramIds(
      user
    );

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

    const programs = allPrograms.filter((p) =>
      ids.find((id) => id.toString() === p.id)
    );

    return await Promise.all(
      programs.map(async (program) => {
        const poolTokenAmountWei = poolTokenStakedWei.get(program.id) || '0';
        const tokenAmountWei =
          await ContractsApi.BancorNetworkInfo.read.poolTokenToUnderlying(
            program.pool,
            poolTokenAmountWei
          );

        const pendingRewardsWei =
          await ContractsApi.StandardRewards.read.pendingRewards(user, [
            program.id,
          ]);

        const rewardsToken = poolsMap.get(program.rewardsToken)?.reserveToken;

        return {
          id: program.id,
          poolDltId: program.pool,
          rewardsToken: rewardsToken!,
          pendingRewardsWei: pendingRewardsWei.toString(),
          poolTokenAmountWei,
          tokenAmountWei: tokenAmountWei.toString(),
        };
      })
    );
  } catch (e) {
    console.error('failed to fetchStandardRewardsByUser', e);
    throw e;
  }
};

export interface RewardsProgramRaw {
  id: string;
  pool: string;
  poolToken: string;
  rewardsToken: string;
  isEnabled: boolean;
  startTime: number;
  endTime: number;
  rewardRate: string;
  isActive: boolean;
}

export const fetchAllStandardRewards = async (): Promise<
  RewardsProgramRaw[]
> => {
  try {
    const ids = await ContractsApi.StandardRewards.read.programIds();

    const programs = await ContractsApi.StandardRewards.read.programs(ids);

    return programs.map((program) => ({
      id: program.id.toString(),
      pool: program.pool,
      poolToken: program.poolToken,
      rewardsToken: program.rewardsToken,
      isEnabled: program.isEnabled,
      startTime: program.startTime,
      endTime: program.endTime,
      rewardRate: program.rewardRate.toString(),
      isActive:
        program.isEnabled &&
        program.startTime <= dayjs.utc().unix() &&
        program.endTime >= dayjs.utc().unix(),
    }));
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const buildLatestProgramIdCall = (poolId: string): MultiCall => {
  const contract = ContractsApi.StandardRewards.read;

  return {
    contractAddress: contract.address,
    interface: contract.interface,
    methodName: 'latestProgramId',
    methodParameters: [poolId],
  };
};

export const fetchLatestProgramIdsMulticall = async (apiPools: APIPoolV3[]) => {
  const calls = apiPools.map(({ poolDltId }) =>
    buildLatestProgramIdCall(poolDltId)
  );
  const res = await multicall(calls);
  if (!res) {
    throw new Error('Multicall Error in fetchLatestProgramIdsMulticall');
  }

  return new Map(
    res.map((bn, idx) => [
      apiPools[idx].poolDltId,
      bn && bn.length ? bn[0].toString() : undefined,
    ])
  );
};
