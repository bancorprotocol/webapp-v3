import { useQuery } from 'react-query';
import { fetchMulticall, MultiCall } from 'services/web3/multicall/multicall';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { ethToken } from 'services/web3/config';
import { BigNumber, utils } from 'ethers';
import { RewardsProgramRaw } from 'services/web3/v3/portfolio/standardStaking';
import dayjs from 'dayjs';

export interface PriceDictionaryV3 {
  bnt?: string;
  usd?: string;
  eur?: string;
  eth?: string;
  tkn: string;
}

export interface PoolApr {
  tradingFees: number;
  standardRewards: number;
  autoCompounding: number;
  total: number;
}

export interface PoolV3Chain {
  poolDltId: string;
  poolTokenDltId: string;
  name: string;
  symbol: string;
  decimals: number;
  tradingLiquidity: {
    BNT: PriceDictionaryV3;
    TKN: PriceDictionaryV3;
  };
  stakedBalance: PriceDictionaryV3;
  tradingFeePPM: number;
  tradingEnabled: boolean;
  depositingEnabled: boolean;
  programs: RewardsProgramRaw[];
  logoURI: string;
  latestProgram?: RewardsProgramRaw;
  tknBalance?: string;
  bnTknBalance?: string;
  volume?: {
    volume7d: PriceDictionaryV3;
    volume24h: PriceDictionaryV3;
  };
  fees?: {
    fees7d: PriceDictionaryV3;
    fees24h: PriceDictionaryV3;
  };
  apr?: {
    apr24h: PoolApr;
    apr7d: PoolApr;
  };
  standardRewards?: {
    claimed24h: PriceDictionaryV3;
    providerJoined: PriceDictionaryV3;
    providerLeft: PriceDictionaryV3;
    staked: PriceDictionaryV3;
  };
}

const fetchEthData = async (): Promise<PoolV3Chain> => {
  const ethDataCalls: MultiCall[] = [
    {
      contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
      interface: ContractsApi.BancorNetworkInfo.read.interface,
      methodName: 'poolToken',
      methodParameters: [ethToken],
    },
    {
      contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
      interface: ContractsApi.BancorNetworkInfo.read.interface,
      methodName: 'tradingLiquidity',
      methodParameters: [ethToken],
    },
    {
      contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
      interface: ContractsApi.BancorNetworkInfo.read.interface,
      methodName: 'tradingEnabled',
      methodParameters: [ethToken],
    },
    {
      contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
      interface: ContractsApi.BancorNetworkInfo.read.interface,
      methodName: 'depositingEnabled',
      methodParameters: [ethToken],
    },
    {
      contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
      interface: ContractsApi.BancorNetworkInfo.read.interface,
      methodName: 'stakedBalance',
      methodParameters: [ethToken],
    },
    {
      contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
      interface: ContractsApi.BancorNetworkInfo.read.interface,
      methodName: 'tradingFeePPM',
      methodParameters: [ethToken],
    },
    {
      contractAddress: ContractsApi.StandardRewards.contractAddress,
      interface: ContractsApi.StandardRewards.read.interface,
      methodName: 'latestProgramId',
      methodParameters: [ethToken],
    },
  ];
  const res = await fetchMulticall<any>(ethDataCalls);

  return {
    poolDltId: ethToken,
    name: 'Ethereum',
    symbol: 'ETH',
    poolTokenDltId: res[0],
    decimals: 18,
    tradingEnabled: res[2],
    tradingLiquidity: {
      BNT: {
        bnt: utils.formatUnits(res[1].bntTradingLiquidity, 18),
        tkn: utils.formatUnits(res[1].bntTradingLiquidity, 18),
      },
      TKN: {
        tkn: utils.formatUnits(res[1].baseTokenTradingLiquidity, 18),
      },
    },
    depositingEnabled: res[3],
    stakedBalance: { tkn: utils.formatUnits(res[4], 18) },
    tradingFeePPM: res[5],
    programs: [],
    logoURI:
      'https://d1wmp5nysbq9xl.cloudfront.net/ethereum/tokens/' +
      ethToken.toLowerCase() +
      '.svg',
  };
};

const fetchChainV3Programs = async (
  ids: BigNumber[]
): Promise<RewardsProgramRaw[]> => {
  const programs = await ContractsApi.StandardRewards.read.programs(ids);
  return programs.map((program) => {
    const data: RewardsProgramRaw = {
      id: program.id.toString(),
      pool: program.pool,
      poolToken: program.poolToken,
      rewardsToken: program.rewardsToken,
      rewardRate: program.rewardRate.toString(),
      isEnabled: program.isEnabled,
      startTime: program.startTime,
      endTime: program.endTime,
      isActive:
        program.isEnabled &&
        program.startTime <= dayjs.utc().unix() &&
        program.endTime >= dayjs.utc().unix(),
    };
    return data;
  });
};

const fetchV3ChainData = async (): Promise<PoolV3Chain[]> => {
  const [liquidityPools, programIds] = await Promise.all([
    ContractsApi.BancorNetwork.read.liquidityPools(),
    ContractsApi.StandardRewards.read.programIds(),
  ]);

  const pools = liquidityPools.filter((id) => id !== ethToken);

  const poolTokensCalls: MultiCall[] = [];
  const tokenDecimalsCalls: MultiCall[] = [];
  const tokenNamesCalls: MultiCall[] = [];
  const tokenSymbolCalls: MultiCall[] = [];
  const tradingLiquidityCalls: MultiCall[] = [];
  const tradingEnabledCalls: MultiCall[] = [];
  const depositingEnabledCalls: MultiCall[] = [];
  const stakedBalanceCalls: MultiCall[] = [];
  const tradingFeePPMCalls: MultiCall[] = [];
  const latestProgramIdCalls: MultiCall[] = [];

  pools.forEach((id) => {
    poolTokensCalls.push({
      contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
      interface: ContractsApi.BancorNetworkInfo.read.interface,
      methodName: 'poolToken',
      methodParameters: [id],
    });
    tokenDecimalsCalls.push({
      contractAddress: id,
      interface: ContractsApi.Token(id).read.interface,
      methodName: 'decimals',
      methodParameters: [],
    });
    tokenNamesCalls.push({
      contractAddress: id,
      interface: ContractsApi.Token(id).read.interface,
      methodName: 'name',
      methodParameters: [],
    });
    tokenSymbolCalls.push({
      contractAddress: id,
      interface: ContractsApi.Token(id).read.interface,
      methodName: 'symbol',
      methodParameters: [],
    });
    tradingLiquidityCalls.push({
      contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
      interface: ContractsApi.BancorNetworkInfo.read.interface,
      methodName: 'tradingLiquidity',
      methodParameters: [id],
    });
    tradingEnabledCalls.push({
      contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
      interface: ContractsApi.BancorNetworkInfo.read.interface,
      methodName: 'tradingEnabled',
      methodParameters: [id],
    });
    depositingEnabledCalls.push({
      contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
      interface: ContractsApi.BancorNetworkInfo.read.interface,
      methodName: 'depositingEnabled',
      methodParameters: [id],
    });
    stakedBalanceCalls.push({
      contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
      interface: ContractsApi.BancorNetworkInfo.read.interface,
      methodName: 'stakedBalance',
      methodParameters: [id],
    });
    tradingFeePPMCalls.push({
      contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
      interface: ContractsApi.BancorNetworkInfo.read.interface,
      methodName: 'tradingFeePPM',
      methodParameters: [id],
    });
    latestProgramIdCalls.push({
      contractAddress: ContractsApi.StandardRewards.contractAddress,
      interface: ContractsApi.StandardRewards.read.interface,
      methodName: 'latestProgramId',
      methodParameters: [id],
    });
  });

  const [
    poolTokens,
    tokenDecimals,
    tokenNames,
    tokenSymbols,
    tradingEnabled,
    tradingLiquidity,
    depositingEnabled,
    stakedBalance,
    tradingFeePPM,
    latestProgramIds,
    ethData,
    programs,
  ] = await Promise.all([
    fetchMulticall<string>(poolTokensCalls),
    fetchMulticall<number>(tokenDecimalsCalls),
    fetchMulticall<string>(tokenNamesCalls, true),
    fetchMulticall<string>(tokenSymbolCalls, true),
    fetchMulticall<boolean>(tradingEnabledCalls),
    fetchMulticall<any>(tradingLiquidityCalls),
    fetchMulticall<boolean>(depositingEnabledCalls),
    fetchMulticall<string>(stakedBalanceCalls),
    fetchMulticall<number>(tradingFeePPMCalls),
    fetchMulticall<number>(latestProgramIdCalls),
    fetchEthData(),
    fetchChainV3Programs(programIds),
  ]);

  const data: PoolV3Chain[] = pools.map((id, i) => ({
    poolDltId: id,
    name: tokenNames[i],
    symbol: tokenSymbols[i],
    poolTokenDltId: poolTokens[i],
    decimals: tokenDecimals[i],
    tradingEnabled: tradingEnabled[i],
    tradingLiquidity: {
      BNT: {
        bnt: utils.formatUnits(
          tradingLiquidity[i].baseTokenTradingLiquidity,
          tokenDecimals[i]
        ),
        tkn: utils.formatUnits(tradingLiquidity[i].bntTradingLiquidity, 18),
      },
      TKN: {
        tkn: utils.formatUnits(
          tradingLiquidity[i].baseTokenTradingLiquidity,
          tokenDecimals[i]
        ),
      },
    },
    depositingEnabled: depositingEnabled[i],
    stakedBalance: {
      tkn: utils.formatUnits(stakedBalance[i], tokenDecimals[i]),
    },
    tradingFeePPM: tradingFeePPM[i],
    latestProgram: latestProgramIds[i]
      ? programs.find((p) => p.pool === id)
      : undefined,
    programs: programs.filter((p) => p.pool === id),
    logoURI:
      'https://d1wmp5nysbq9xl.cloudfront.net/ethereum/tokens/' +
      id.toLowerCase() +
      '.svg',
  }));
  data.push(ethData);
  return data;
};

const fetchV3ChainPoolTokens = async (
  poolIds: string[]
): Promise<Map<string, string>> => {
  const calls: MultiCall[] = poolIds.map((id) => ({
    contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
    interface: ContractsApi.BancorNetworkInfo.read.interface,
    methodName: 'poolToken',
    methodParameters: [id],
  }));

  const data = await fetchMulticall<string>(calls);

  return new Map(data.map((id, i) => [poolIds[i], id]));
};

export const useV3ChainPoolIds = () => {
  return useQuery(
    ['chain', 'v3', 'poolIds'],
    () => ContractsApi.BancorNetwork.read.liquidityPools(),
    {
      refetchInterval: 144 * 1000,
      staleTime: 88 * 1000,
    }
  );
};

export const useV3ChainPoolTokenIds = () => {
  const { data: poolIds } = useV3ChainPoolIds();
  return useQuery(
    ['chain', 'v3', 'poolTokenIds'],
    () => fetchV3ChainPoolTokens(poolIds!),
    {
      enabled: poolIds !== undefined,
      refetchInterval: 144 * 1000,
      staleTime: 88 * 1000,
    }
  );
};

export const useV3ChainData = () => {
  return useQuery(['chain', 'v3', 'pools'], fetchV3ChainData, {
    refetchInterval: 144 * 1000,
    staleTime: 88 * 1000,
  });
};
