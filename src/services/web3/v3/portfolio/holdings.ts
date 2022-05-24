import { ContractsApi } from 'services/web3/v3/contractsApi';
import { fetchTokenBalanceMulticall } from 'services/web3/token/token';
import { HoldingRaw } from 'store/portfolio/v3Portfolio.types';
import BigNumber from 'bignumber.js';
import { multicall } from 'services/web3/multicall/multicall';
import { APIPoolV3 } from 'services/api/bancorApi/bancorApi.types';

const fetchPoolTokenToUnderlyingMulticall = async (
  data: { poolDltId: string; amount: string }[]
): Promise<Map<string, string>> => {
  const calls = data.map(({ poolDltId, amount }) => ({
    contractAddress: ContractsApi.BancorNetworkInfo.read.address,
    interface: ContractsApi.BancorNetworkInfo.read.interface,
    methodName: 'poolTokenToUnderlying',
    methodParameters: [poolDltId, amount],
  }));
  const res = await multicall(calls);

  if (!res || !res.length) {
    throw new Error('Multicall Error while fetching pool token to underlying');
  }

  return new Map(
    res.map((bn, idx) => {
      const tokenId = data[idx].poolDltId;
      const amount = bn && bn.length ? bn[0].toString() : '0';
      return [tokenId, amount];
    })
  );
};

export const fetchPortfolioV3Holdings = async (
  apiPools: APIPoolV3[],
  user: string
): Promise<HoldingRaw[]> => {
  try {
    const poolTokenIdsMap = new Map(
      apiPools.map((pool) => [pool.poolDltId, pool.poolTokenDltId])
    );
    const poolTokenIds = apiPools.map((pool) => pool.poolTokenDltId);
    const poolTokenBalancesMap = await fetchTokenBalanceMulticall(
      poolTokenIds,
      user
    );

    const poolIdsWithPoolTokenBalance = apiPools.map(({ poolDltId }) => {
      const poolTokenId = poolTokenIdsMap.get(poolDltId) ?? '';
      const amount = poolTokenBalancesMap.get(poolTokenId) ?? '0';
      return {
        poolDltId,
        amount,
      };
    });

    const poolTokenToUnderlyingMap = await fetchPoolTokenToUnderlyingMulticall(
      poolIdsWithPoolTokenBalance
    );

    const holdingsRaw: HoldingRaw[] = apiPools
      .map(({ poolDltId }) => {
        const poolTokenId = poolTokenIdsMap.get(poolDltId) ?? '';
        const poolTokenBalanceWei = poolTokenBalancesMap.get(poolTokenId);
        const tokenBalanceWei = poolTokenToUnderlyingMap.get(poolDltId);

        if (!poolTokenId || !poolTokenBalanceWei || !tokenBalanceWei) {
          return undefined;
        }

        return {
          poolDltId,
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
