import { fetchMulticall, MultiCall } from 'services/web3/multicall/multicall';
import { ContractsApi } from 'services/web3/v3/contractsApi';

export const fetchMulticallHelper = async <T>(
  poolIds: string[],
  buildMulticall: (id: string) => MultiCall,
  toUtf8String?: boolean
): Promise<Map<string, T>> => {
  const calls: MultiCall[] = poolIds.map((id) => buildMulticall(id));

  const data = await fetchMulticall<T>(calls, toUtf8String);

  return new Map(data.map((id, i) => [poolIds[i], id]));
};

export const buildMulticallSymbol = (id: string) => ({
  contractAddress: id,
  interface: ContractsApi.Token(id).read.interface,
  methodName: 'symbol',
  methodParameters: [],
});

export const buildMulticallName = (id: string) => ({
  contractAddress: id,
  interface: ContractsApi.Token(id).read.interface,
  methodName: 'name',
  methodParameters: [],
});

export const buildMulticallDecimal = (id: string) => ({
  contractAddress: id,
  interface: ContractsApi.Token(id).read.interface,
  methodName: 'decimals',
  methodParameters: [],
});

export const buildMulticallPoolToken = (id: string) => ({
  contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
  interface: ContractsApi.BancorNetworkInfo.read.interface,
  methodName: 'poolToken',
  methodParameters: [id],
});

export const buildMulticallTradingEnabled = (id: string) => ({
  contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
  interface: ContractsApi.BancorNetworkInfo.read.interface,
  methodName: 'tradingEnabled',
  methodParameters: [id],
});

export const buildMulticallTradingLiquidity = (id: string) => ({
  contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
  interface: ContractsApi.BancorNetworkInfo.read.interface,
  methodName: 'tradingLiquidity',
  methodParameters: [id],
});

export const buildMulticallDepositingEnabled = (id: string) => ({
  contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
  interface: ContractsApi.BancorNetworkInfo.read.interface,
  methodName: 'depositingEnabled',
  methodParameters: [id],
});

export const buildMulticallStakedBalance = (id: string) => ({
  contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
  interface: ContractsApi.BancorNetworkInfo.read.interface,
  methodName: 'stakedBalance',
  methodParameters: [id],
});

export const buildMulticallTradingFee = (id: string) => ({
  contractAddress: ContractsApi.BancorNetworkInfo.contractAddress,
  interface: ContractsApi.BancorNetworkInfo.read.interface,
  methodName: 'tradingFeePPM',
  methodParameters: [id],
});

export const buildMulticallLatestProgramId = (id: string) => ({
  contractAddress: ContractsApi.StandardRewards.contractAddress,
  interface: ContractsApi.StandardRewards.read.interface,
  methodName: 'latestProgramId',
  methodParameters: [id],
});
