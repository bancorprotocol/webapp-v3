import { ContractsApi } from 'services/web3/v3/contractsApi';
import { fetchTokenBalanceMulticall } from 'services/web3/token/token';
import { HoldingRaw } from 'redux/portfolio/v3Portfolio.types';
import BigNumber from 'bignumber.js';
import { multicall } from 'services/web3/multicall/multicall';

const fetchPoolTokenIdsMulticall = async (
  ids: string[]
): Promise<Map<string, string>> => {
  const calls = ids.map((id) => ({
    contractAddress: ContractsApi.PoolCollection.read.address,
    interface: ContractsApi.PoolCollection.read.interface,
    methodName: 'poolToken',
    methodParameters: [id],
  }));
  const res = await multicall(calls);

  if (!res || !res.length) {
    throw new Error('Multicall Error while fetching pool token ids');
  }

  return new Map(
    res.map((id, idx) => {
      const tokenId = ids[idx];
      const poolTokenId = id && id.length ? id[0] : '';
      return [tokenId, poolTokenId];
    })
  );
};

const fetchPoolTokenToUnderlyingMulticall = async (
  data: { poolId: string; amount: string }[]
): Promise<Map<string, string>> => {
  const calls = data.map(({ poolId, amount }) => ({
    contractAddress: ContractsApi.BancorNetworkInfo.read.address,
    interface: ContractsApi.BancorNetworkInfo.read.interface,
    methodName: 'poolTokenToUnderlying',
    methodParameters: [poolId, amount],
  }));
  const res = await multicall(calls);

  if (!res || !res.length) {
    throw new Error('Multicall Error while fetching pool token to underlying');
  }

  return new Map(
    res.map((bn, idx) => {
      const tokenId = data[idx].poolId;
      const amount = bn && bn.length ? bn[0].toString() : '0';
      return [tokenId, amount];
    })
  );
};

export const fetchPortfolioV3Holdings = async (
  user?: string
): Promise<HoldingRaw[]> => {
  if (!user) {
    return [];
  }

  try {
    const poolIds = await ContractsApi.BancorNetwork.read.liquidityPools();
    const poolTokenIdsMap = await fetchPoolTokenIdsMulticall(poolIds);
    const poolTokenIds = Array.from(poolTokenIdsMap.values());

    const poolTokenBalancesMap = await fetchTokenBalanceMulticall(
      poolTokenIds,
      user
    );

    const poolIdsWithPoolTokenBalance = poolIds.map((poolId) => {
      const poolTokenId = poolTokenIdsMap.get(poolId) ?? '';
      const amount = poolTokenBalancesMap.get(poolTokenId) ?? '0';
      return {
        poolId,
        amount,
      };
    });

    const poolTokenToUnderlyingMap = await fetchPoolTokenToUnderlyingMulticall(
      poolIdsWithPoolTokenBalance
    );

    const holdingsRaw: HoldingRaw[] = poolIds
      .map((poolId) => {
        const poolTokenId = poolTokenIdsMap.get(poolId) ?? '';
        const poolTokenBalanceWei = poolTokenBalancesMap.get(poolTokenId);
        const tokenBalanceWei = poolTokenToUnderlyingMap.get(poolId);

        if (!poolTokenId || !poolTokenBalanceWei || !tokenBalanceWei) {
          return undefined;
        }

        return {
          poolId,
          poolTokenId,
          poolTokenBalanceWei,
          tokenBalanceWei,
        } as HoldingRaw;
      })
      .filter((holdingRaw) => !!holdingRaw) as HoldingRaw[];

    return holdingsRaw.filter((h) => new BigNumber(h.tokenBalanceWei).gt(0));
  } catch (e) {
    console.error('failed to fetchPortfolioV3Holdings', e);
    throw e;
  }
};
