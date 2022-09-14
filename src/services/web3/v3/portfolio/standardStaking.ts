import { ContractsApi } from 'services/web3/v3/contractsApi';
import { multicall, MultiCall } from 'services/web3/multicall/multicall';
import { BigNumber } from 'ethers';
import { Token } from 'services/observables/tokens';
import { PoolV3 } from 'services/observables/pools';
import { APIPoolV3 } from 'services/api/bancorApi/bancorApi.types';
import { toBigNumber } from 'utils/helperFunctions';
import { web3 } from 'services/web3/index';
import { ProgramDataStructOutput } from 'services/web3/abis/types/StandardRewards';

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
        const tokenAmountWei = toBigNumber(poolTokenAmountWei).gt(0)
          ? await ContractsApi.BancorNetworkInfo.read.poolTokenToUnderlying(
              program.pool,
              poolTokenAmountWei
            )
          : '0';

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
  startTime: number;
  endTime: number;
  rewardRate: string;
  isActive: boolean;
  stakedBalanceInBNTKN: string;
  stakedBalanceInTKN: string;
}

export const fetchAllStandardRewards = async (): Promise<
  RewardsProgramRaw[]
> => {
  try {
    const ids = await ContractsApi.StandardRewards.read.programIds();

    const [programs, programsStaked, block] = await Promise.all([
      ContractsApi.StandardRewards.read.programs(ids),
      fetchProgramStakeMulticall(ids),
      web3.provider.getBlock('latest'),
    ]);

    const programsStakedToUnderlying =
      await fetchProgramStakeToUnderlyingMulticall(programs, programsStaked);

    return programs.map((program) => ({
      id: program.id.toString(),
      pool: program.pool,
      poolToken: program.poolToken,
      rewardsToken: program.rewardsToken,
      startTime: program.startTime,
      endTime: program.endTime,
      rewardRate: program.rewardRate.toString(),
      isActive:
        program.startTime <= block.timestamp &&
        program.endTime >= block.timestamp,
      stakedBalanceInBNTKN: programsStaked?.get(program.id.toString()) ?? '0',
      stakedBalanceInTKN:
        programsStakedToUnderlying?.get(program.id.toString()) ?? '0',
    }));
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const buildProgramStakeCall = (id: BigNumber): MultiCall => {
  const contract = ContractsApi.StandardRewards.read;

  return {
    contractAddress: contract.address,
    interface: contract.interface,
    methodName: 'programStake',
    methodParameters: [id],
  };
};

export const fetchProgramStakeMulticall = async (ids: BigNumber[]) => {
  const calls = ids.map((id) => buildProgramStakeCall(id));
  const res = await multicall(calls);
  if (!res) {
    console.error('Multicall Error in fetchProgamStakeMulticall');
    return undefined;
  }

  return new Map<string, string | undefined>(
    res.map((bn, idx) => [
      ids[idx].toString(),
      bn && bn.length ? bn[0].toString() : undefined,
    ])
  );
};

export const fetchProgramStakeToUnderlyingMulticall = async (
  programs: ProgramDataStructOutput[],
  balances?: Map<string, string | undefined>
) => {
  const contract = ContractsApi.BancorNetworkInfo.read;

  const calls = programs.map((p) => ({
    contractAddress: contract.address,
    interface: contract.interface,
    methodName: 'poolTokenToUnderlying',
    methodParameters: [p.pool, balances?.get(p.id.toString()) ?? '0'],
  }));

  const res = await multicall(calls);
  if (!res) {
    console.error('Multicall Error in fetchProgramStakeToUnderlyingMulticall');
    return undefined;
  }

  return new Map<string, string | undefined>(
    res.map((bn, idx) => [
      programs[idx].id.toString(),
      bn && bn.length ? bn[0].toString() : undefined,
    ])
  );
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
    console.error('Multicall Error in fetchLatestProgramIdsMulticall');
    return undefined;
  }

  return new Map<string, string | undefined>(
    res.map((bn, idx) => [
      apiPools[idx].poolDltId,
      bn && bn.length ? bn[0].toString() : undefined,
    ])
  );
};
