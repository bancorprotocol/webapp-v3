import { useQuery } from 'react-query';
import { MultiCall } from 'services/web3/multicall/multicall';
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

export interface PoolV3Chain {
  poolDltId: string;
  poolTokenDltId: string;
  name: string;
  symbol: string;
  decimals: number;
  tradingLiquidityBNT: PriceDictionaryV3;
  tradingLiquidityTKN: PriceDictionaryV3;
  volume24h?: PriceDictionaryV3;
  fees24h?: PriceDictionaryV3;
  stakedBalance: PriceDictionaryV3;
  tradingFeePPM: string;
  tradingEnabled: boolean;
  depositingEnabled: boolean;
  standardRewardsClaimed24h?: PriceDictionaryV3;
  standardRewardsProviderJoined?: PriceDictionaryV3;
  standardRewardsProviderLeft?: PriceDictionaryV3;
  standardRewardsStaked?: PriceDictionaryV3;
  volume7d?: PriceDictionaryV3;
  fees7d?: PriceDictionaryV3;
  apr24h?: {
    tradingFees: number;
    standardRewards: number;
    autoCompounding: number;
    total: number;
  };
  apr7d?: {
    tradingFees: number;
    standardRewards: number;
    autoCompounding: number;
    total: number;
  };
  programs: RewardsProgramRaw[];
  latestProgram?: RewardsProgramRaw;
  logoURI: string;
  tknBalance?: string;
  bnTknBalance?: string;
}

const fetchMulticall = async (
  calls: MultiCall[],
  toUtf8String = false,
  blockHeight?: number
) => {
  try {
    const encoded = calls.map((call) => ({
      target: call.contractAddress,
      callData: call.interface.encodeFunctionData(
        call.methodName,
        call.methodParameters
      ),
    }));

    const encodedRes = await ContractsApi.Multicall.read.tryAggregate(
      false,
      encoded,
      {
        blockTag: blockHeight,
      }
    );

    return encodedRes.map((call, i) => {
      if (!call.success) {
        console.log(calls[i]);
        throw new Error('multicall failed');
      }
      if (toUtf8String) {
        return utils.toUtf8String(call.returnData).replace(/[^a-zA-Z0-9]/g, '');
      }
      const res = calls[i].interface.decodeFunctionResult(
        calls[i].methodName,
        call.returnData
      );
      return res[0];
    });
  } catch (error) {
    throw error;
  }
};

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
    {
      contractAddress: ContractsApi.StandardRewards.contractAddress,
      interface: ContractsApi.StandardRewards.read.interface,
      methodName: 'latestProgramId',
      methodParameters: [ethToken],
    },
  ];
  const res = await fetchMulticall(ethDataCalls);

  return {
    poolDltId: ethToken,
    name: 'Ethereum',
    symbol: 'ETH',
    poolTokenDltId: res[0],
    decimals: 18,
    tradingEnabled: res[2],
    tradingLiquidityBNT: {
      bnt: utils.formatUnits(res[1].bntTradingLiquidity, 18),
      tkn: utils.formatUnits(res[1].bntTradingLiquidity, 18),
    },
    tradingLiquidityTKN: {
      tkn: utils.formatUnits(res[1].baseTokenTradingLiquidity, 18),
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
    fetchMulticall(poolTokensCalls),
    fetchMulticall(tokenDecimalsCalls),
    fetchMulticall(tokenNamesCalls, true),
    fetchMulticall(tokenSymbolCalls, true),
    fetchMulticall(tradingEnabledCalls),
    fetchMulticall(tradingLiquidityCalls),
    fetchMulticall(depositingEnabledCalls),
    fetchMulticall(stakedBalanceCalls),
    fetchMulticall(tradingFeePPMCalls),
    fetchMulticall(latestProgramIdCalls),
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
    tradingLiquidityBNT: {
      bnt: utils.formatUnits(
        tradingLiquidity[i].baseTokenTradingLiquidity,
        tokenDecimals[i]
      ),
      tkn: utils.formatUnits(tradingLiquidity[i].bntTradingLiquidity, 18),
    },
    tradingLiquidityTKN: {
      tkn: utils.formatUnits(
        tradingLiquidity[i].baseTokenTradingLiquidity,
        tokenDecimals[i]
      ),
    },
    depositingEnabled: depositingEnabled[i],
    stakedBalance: {
      tkn: utils.formatUnits(stakedBalance[i], tokenDecimals[i]),
    },
    tradingFeePPM: tradingFeePPM[i],
    latestProgram: latestProgramIds[i]
      ? latestProgramIds[i].toString()
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

export const useV3ChainData = () => {
  return useQuery(['chain', 'v3', 'pools'], fetchV3ChainData, {
    refetchInterval: 144 * 1000,
    staleTime: 88 * 1000,
  });
};
