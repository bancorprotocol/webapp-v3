import { PoolV3Chain } from 'queries/useV3ChainData';
import { useChainTokenSymbol } from 'queries/chain/useChainTokenSymbol';
import { useChainTokenDecimals } from 'queries/chain/useChainTokenDecimals';
import { useChainPoolTokenIds } from 'queries/chain/useChainPoolTokenIds';
import { useChainPrograms } from 'queries/chain/useChainPrograms';
import { useChainTradingEnabled } from 'queries/chain/useChainTradingEnabled';
import { useApiApr } from 'queries/api/useApiApr';
import { useChainTradingLiquidity } from 'queries/chain/useChainTradingLiquidity';
import { useApiFees } from 'queries/api/useApiFees';

type Pool = Pick<
  PoolV3Chain,
  | 'symbol'
  | 'decimals'
  | 'poolTokenDltId'
  | 'programs'
  | 'tradingEnabled'
  | 'poolDltId'
  | 'apr'
  | 'tradingLiquidity'
  | 'fees'
>;

type PoolKey = keyof Pool;
type Fetchers = {
  [key in PoolKey]: (id: string) => Pool[key] | undefined;
};

const useFetchers = (select: PoolKey[]): Fetchers => {
  const set = new Set(select.map((key) => key));

  const { getSymbolByID } = useChainTokenSymbol({
    enabled: set.has('symbol'),
  });

  const { getDecimalsByID } = useChainTokenDecimals({
    enabled: set.has('decimals'),
  });

  const { getPoolTokenByID } = useChainPoolTokenIds({
    enabled: set.has('poolTokenDltId'),
  });

  const { getProgramsByID } = useChainPrograms({
    enabled: set.has('programs'),
  });

  const { getTradingEnabledByID } = useChainTradingEnabled({
    enabled: set.has('tradingEnabled'),
  });

  const { getTradingLiquidityByID } = useChainTradingLiquidity({
    enabled: set.has('tradingLiquidity'),
  });

  const { getFeeByID } = useApiFees({
    enabled: set.has('fees'),
  });

  const { getAprByID } = useApiApr({
    enabled: set.has('apr'),
  });

  return {
    poolDltId: (id) => id,
    symbol: getSymbolByID,
    decimals: getDecimalsByID,
    poolTokenDltId: getPoolTokenByID,
    programs: getProgramsByID,
    tradingEnabled: getTradingEnabledByID,
    apr: getAprByID,
    tradingLiquidity: getTradingLiquidityByID,
    fees: getFeeByID,
  };
};

export const usePoolPick = <T extends PoolKey[]>(id: string, select: T) => {
  const fetchers = useFetchers(select);

  return select.reduce((res, key) => {
    // @ts-ignore
    res[key] = fetchers[key](id);
    return res;
  }, {}) as Pick<Pool, T[number]>;
};
