import { useChainSymbol } from 'queries/chain/useChainSymbol';
import { useChainDecimals } from 'queries/chain/useChainDecimals';
import { useChainPoolTokenIds } from 'queries/chain/useChainPoolTokenIds';
import { useChainPrograms } from 'queries/chain/useChainPrograms';
import { useChainTradingEnabled } from 'queries/chain/useChainTradingEnabled';
import { useApiApr } from 'queries/api/useApiApr';
import { useApiTradingLiquidity } from 'queries/api/useApiTradingLiquidity';
import { useApiFees } from 'queries/api/useApiFees';
import { useApiVolume } from 'queries/api/useApiVolume';
import { useApiStakedBalance } from 'queries/api/useApiStakedBalance';
import { useChainLatestProgram } from 'queries/chain/useChainLatestProgram';
import { PoolV3Chain } from 'queries/types';
import { useChainBalances } from 'queries/chain/useChainBalances';
import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { useApiRate } from 'queries/api/useApiRate';
import { useChainDepositingEnabled } from 'queries/chain/useChainDepositingEnabled';

type PoolNew = Omit<
  PoolV3Chain,
  'name' | 'standardRewards' | 'tradingFeePPM' | 'rate24hAgo'
>;

type PoolKey = keyof PoolNew;

type Fetchers = {
  [key in PoolKey]: {
    getByID: (id: string) => PoolNew[key] | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
  };
};

type PoolReturn<T extends PoolKey[]> = Pick<PoolNew, T[number]> extends infer R
  ? { [key in keyof R]: R[key] }
  : never;

const useFetchers = (select: PoolKey[]) => {
  const set = new Set(select.map((key) => key));

  const symbol = useChainSymbol({
    enabled: set.has('symbol'),
  });

  const decimals = useChainDecimals({
    enabled: set.has('decimals'),
  });

  const poolTokenDltId = useChainPoolTokenIds({
    enabled: set.has('poolTokenDltId'),
  });

  const programs = useChainPrograms({
    enabled: set.has('programs'),
  });

  const tradingEnabled = useChainTradingEnabled({
    enabled: set.has('tradingEnabled'),
  });

  const depositingEnabled = useChainDepositingEnabled({
    enabled: set.has('depositingEnabled'),
  });

  const tradingLiquidity = useApiTradingLiquidity({
    enabled: set.has('tradingLiquidity'),
  });

  const latestProgram = useChainLatestProgram({
    enabled: set.has('latestProgram'),
  });

  const fees = useApiFees({
    enabled: set.has('fees'),
  });

  const apr = useApiApr({
    enabled: set.has('apr'),
  });

  const volume = useApiVolume({
    enabled: set.has('volume'),
  });

  const rate = useApiRate({
    enabled: set.has('rate'),
  });

  const stakedBalance = useApiStakedBalance({
    enabled: set.has('stakedBalance'),
  });

  const balance = useChainBalances({
    enabled: set.has('balance'),
  });

  const fetchers: Fetchers = {
    poolDltId: {
      getByID: (id: string) => id,
      isError: false,
      isFetching: false,
      isLoading: false,
    },
    symbol,
    decimals,
    poolTokenDltId,
    programs,
    tradingEnabled,
    depositingEnabled,
    apr,
    tradingLiquidity,
    fees,
    volume,
    stakedBalance,
    latestProgram,
    balance,
    rate,
  };

  const isLoading = select.some((res) => fetchers[res].isLoading);
  const isFetching = select.some((res) => fetchers[res].isFetching);
  const isError = select.some((res) => fetchers[res].isError);

  return { fetchers, isLoading, isFetching, isError };
};

const selectReduce = <T extends PoolKey[]>(
  id: string,
  select: T,
  fetchers: Fetchers
): PoolReturn<T> =>
  select.reduce((res, key) => {
    // @ts-ignore
    res[key] = fetchers[key].getByID(id);
    return res;
  }, {} as PoolReturn<T>);

export const usePoolPick = <T extends PoolKey[]>(select: T) => {
  const idsQuery = useChainPoolIds();
  const { fetchers, isLoading, isFetching, isError } = useFetchers(select);

  const isUndefined = isLoading || isError;

  const getOne = (id: string) => ({
    data: !isUndefined ? selectReduce(id, select, fetchers) : undefined,
    isLoading,
    isFetching,
    isError,
  });

  const getMany = (ids = idsQuery.data) => ({
    data:
      !isUndefined && ids
        ? ids.map((id) => selectReduce(id, select, fetchers))
        : undefined,
    isLoading,
    isFetching,
    isError,
  });

  return { getOne, getMany, isLoading, isFetching, isError };
};
