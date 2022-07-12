import { PoolV3Chain } from 'queries/useV3ChainData';
import { useChainTokenSymbol } from 'queries/chain/useChainTokenSymbol';
import { useChainTokenDecimals } from 'queries/chain/useChainTokenDecimals';
import { useChainPoolTokenIds } from 'queries/chain/useChainPoolTokenIds';
import { useChainPrograms } from 'queries/chain/useChainPrograms';
import { useChainTradingEnabled } from 'queries/chain/useChainTradingEnabled';
import { useApiApr } from 'queries/api/useApiApr';
import { useChainTradingLiquidity } from 'queries/chain/useChainTradingLiquidity';
import { useApiFees } from 'queries/api/useApiFees';
import { useApiVolume } from 'queries/api/useApiVolume';
import { useApiStakedBalance } from 'queries/api/useApiStakedBalance';
import { useChainLatestProgram } from 'queries/chain/useChainLatestProgram';

export type PoolNew = Omit<
  PoolV3Chain,
  | 'name'
  | 'logoURI'
  | 'standardRewards'
  | 'tradingFeePPM'
  | 'depositingEnabled'
  | 'tknBalance'
  | 'bnTknBalance'
>;

export type PoolKey = keyof PoolNew;
type Fetchers = {
  [key in PoolKey]: (id: string) => PoolNew[key] | undefined;
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

  const { getLatestProgramByID } = useChainLatestProgram({
    enabled: set.has('latestProgram'),
  });

  const { getFeeByID } = useApiFees({
    enabled: set.has('fees'),
  });

  const { getAprByID } = useApiApr({
    enabled: set.has('apr'),
  });

  const { getVolumeByID } = useApiVolume({
    enabled: set.has('volume'),
  });

  const { getStakedBalanceByID } = useApiStakedBalance({
    enabled: set.has('stakedBalance'),
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
    volume: getVolumeByID,
    stakedBalance: getStakedBalanceByID,
    latestProgram: getLatestProgramByID,
  };
};

const selectReduce = <T extends PoolKey[]>(
  id: string,
  select: T,
  fetchers: Fetchers
) => {
  return select.reduce((res, key) => {
    // @ts-ignore
    res[key] = fetchers[key](id);
    return res;
  }, {}) as Pick<PoolNew, T[number]>;
};

export const usePoolPick = <T extends PoolKey[]>(select: T) => {
  const fetchers = useFetchers(select);

  const getOne = (id: string) => selectReduce(id, select, fetchers);

  const getMany = (ids: string[]) =>
    ids.map((id) => selectReduce(id, select, fetchers));

  return { getOne, getMany };
};
