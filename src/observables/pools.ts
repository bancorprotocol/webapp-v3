import { getWelcomeData, Pool, Token, WelcomeData } from 'api/bancor';
import { isEqual, partition, uniq, uniqBy, zip } from 'lodash';
import { combineLatest, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  pluck,
  share,
  shareReplay,
  startWith,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { ConverterAndAnchor } from 'web3/types';
import { bancorConverterRegistry$ } from './contracts';
import { switchMapIgnoreThrow } from './customOperators';
import { supportedNetworkVersion$ } from './network';
import { fifteenSeconds$ } from './timers';
import {
  getAnchors,
  getConvertersByAnchors,
} from 'web3/contracts/converterRegistry/wrapper';
import { web3 } from 'web3/contracts';
import { toChecksumAddress } from 'web3-utils';
import {
  expandToken,
  findNewPath,
  findOrThrow,
  mapIgnoreThrown,
  updateArray,
} from 'helpers';
import { getRateByPath } from 'web3/contracts/network/wrapper';

const zipAnchorAndConverters = (
  anchorAddresses: string[],
  converterAddresses: string[]
): ConverterAndAnchor[] => {
  if (anchorAddresses.length !== converterAddresses.length)
    throw new Error(
      'was expecting as many anchor addresses as converter addresses'
    );

  const zipped = zip(anchorAddresses, converterAddresses) as [string, string][];
  return zipped.map(([anchorAddress, converterAddress]) => ({
    anchorAddress: toChecksumAddress(anchorAddress!),
    converterAddress: toChecksumAddress(converterAddress!),
  }));
};

export const apiData$ = combineLatest([
  supportedNetworkVersion$,
  fifteenSeconds$,
]).pipe(
  switchMapIgnoreThrow(([networkVersion]) => getWelcomeData(networkVersion)),
  distinctUntilChanged<WelcomeData>(isEqual),
  share()
);

const trueAnchors$ = bancorConverterRegistry$.pipe(
  switchMapIgnoreThrow((converterRegistry) =>
    getAnchors(converterRegistry, web3)
  ),
  shareReplay(1)
);

const anchorAndConverters$ = combineLatest([
  trueAnchors$,
  bancorConverterRegistry$,
]).pipe(
  switchMapIgnoreThrow(async ([anchorAddresses, converterRegistryAddress]) => {
    const converters = await getConvertersByAnchors({
      anchorAddresses,
      converterRegistryAddress,
      web3,
    });
    const anchorsAndConverters = zipAnchorAndConverters(
      anchorAddresses,
      converters
    );
    return anchorsAndConverters;
  }),
  startWith([]),
  shareReplay<ConverterAndAnchor[]>(1)
);

const apiPools$ = apiData$.pipe(
  pluck('pools'),
  distinctUntilChanged<WelcomeData['pools']>(isEqual),
  shareReplay(1)
);

export const pools$ = combineLatest([apiPools$, anchorAndConverters$]).pipe(
  map(([pools, anchorAndConverters]) => {
    if (anchorAndConverters.length === 0) return pools;
    return updateArray(
      pools,
      (pool) => {
        const correctAnchor = anchorAndConverters.find(
          (anchor) => anchor.anchorAddress === pool.pool_dlt_id
        );
        if (!correctAnchor) return false;
        return correctAnchor.converterAddress !== pool.converter_dlt_id;
      },
      (pool) => {
        const correctAnchor = anchorAndConverters.find(
          (anchor) => anchor.anchorAddress === pool.pool_dlt_id
        )!;
        return {
          ...pool,
          converter_dlt_id: correctAnchor.converterAddress,
        };
      }
    );
  }),
  distinctUntilChanged<WelcomeData['pools']>(isEqual),
  shareReplay(1)
);

export const apiTokens$ = apiData$.pipe(
  pluck('tokens'),
  distinctUntilChanged<WelcomeData['tokens']>(isEqual),
  share()
);

interface SwapOptions {
  fromId: string;
  toId: string;
  decAmount: string;
}

interface MinimalPool {
  anchorAddress: string;
  contract: string;
  reserves: string[];
}

const toMinimal = (pool: Pool): MinimalPool => ({
  anchorAddress: pool.pool_dlt_id,
  contract: pool.converter_dlt_id,
  reserves: pool.reserves.map((reserve) => reserve.address),
});

const swapReceiver$ = new Subject<SwapOptions>();

const sortByLiqDepth = (a: Pool, b: Pool) =>
  Number(b.liquidity.usd) - Number(a.liquidity.usd);

const dropDuplicateReservesByHigherLiquidity = (pools: Pool[]) => {
  const sortedByLiquidityDepth = pools.sort(sortByLiqDepth);
  const uniquePools = uniqBy(sortedByLiquidityDepth, 'pool_dlt_id');

  return uniquePools;
};

const poolHasBalances = (pool: Pool) =>
  pool.reserves.every((reserve) => reserve.balance !== '0');

const filterTradeWorthyPools = (pools: Pool[]) => {
  const poolsWithBalances = pools.filter(poolHasBalances);
  const removedDuplicates =
    dropDuplicateReservesByHigherLiquidity(poolsWithBalances);
  return removedDuplicates;
};

const minimalPoolReserves = (pool: MinimalPool): [string, string] => {
  if (pool.reserves.length !== 2)
    throw new Error('Was expecting a pool of 2 reserves');
  return pool.reserves as [string, string];
};

type TradePath = MinimalPool[];

const possiblePaths = async (
  from: string,
  to: string,
  pools: MinimalPool[]
): Promise<TradePath[]> => {
  const singlePool = pools.find((pool) =>
    [from, to].every((tradedToken) =>
      pool.reserves.some((reserve) => tradedToken === reserve)
    )
  );
  if (singlePool) {
    return [[singlePool]];
  }

  const [validStartingPools, remainingPools] = partition(pools, (pool) =>
    pool.reserves.some((reserve) => reserve === from)
  );
  const isValidTerminatingPool = pools.some((relay) =>
    relay.reserves.some((reserve) => reserve === to)
  );
  const areSufficientPools =
    validStartingPools.length > 0 && isValidTerminatingPool;

  if (!areSufficientPools)
    throw new Error(`No pools found containing both the from and to target`);

  const moreThanOneStartingPool = validStartingPools.length > 1;
  if (moreThanOneStartingPool) {
    const results = await mapIgnoreThrown(
      validStartingPools,
      async (validStartingPool) => {
        const isolatedPools = [validStartingPool, ...remainingPools];
        const poolPath = await findNewPath(
          from,
          to,
          isolatedPools,
          minimalPoolReserves
        );
        return poolPath.hops.flatMap((hop) => hop[0]);
      }
    );
    return results;
  } else {
    const res = await findNewPath(from, to, pools, minimalPoolReserves);
    return [res.hops.flatMap((hop) => hop[0])];
  }
};

const hasAnchor = (anchor: string) => (pool: Pool) =>
  pool.pool_dlt_id === anchor;

const hasTokenId = (tokenAddress: string) => (token: Token) =>
  token.dlt_id === tokenAddress;

const sortPathByBiggestStartingPool = (paths: TradePath[], pools: Pool[]) => {
  const allAnchors = paths.flat(2);
  const uniqueAnchors = uniq(allAnchors);
  const allPoolsFound = uniqueAnchors.every((minimalPool) =>
    pools.some(
      (pool) =>
        pool.pool_dlt_id === minimalPool.anchorAddress &&
        pool.converter_dlt_id === minimalPool.contract
    )
  );
  if (!allPoolsFound)
    throw new Error('Not all paths anchors were found in pools array');
  return paths.sort((a, b) => {
    const startingA = a[0];
    const startingB = b[0];
    const startingAPool = pools.find(hasAnchor(startingA.anchorAddress))!;
    const startingBPool = pools.find(hasAnchor(startingB.anchorAddress))!;
    return sortByLiqDepth(startingAPool, startingBPool);
  });
};

const tradeAndPath$ = swapReceiver$.pipe(
  withLatestFrom(pools$),
  switchMapIgnoreThrow(async ([trade, pools]) => {
    const winningPools = filterTradeWorthyPools(pools);
    const minimalPools = winningPools.map(toMinimal);

    const potentialPaths = await possiblePaths(
      trade.fromId,
      trade.toId,
      minimalPools
    );
    const [biggestStartingPath] = sortPathByBiggestStartingPool(
      potentialPaths,
      winningPools
    );
    return { path: biggestStartingPath, trade };
  }),
  shareReplay(1)
);

const rate$ = tradeAndPath$.pipe(
  withLatestFrom(apiTokens$),
  switchMapIgnoreThrow(async ([trade, tokens]) => {
    const fromToken = findOrThrow(tokens, hasTokenId(trade.trade.fromId));
    const toToken = findOrThrow(tokens, hasTokenId(trade.trade.toId));

    const fromWei = expandToken(trade.trade.decAmount, fromToken.decimals);
    // const rate = await getRateByPath({ })
  })
);

const swapTx$ = tradeAndPath$.pipe(
  withLatestFrom(apiTokens$),
  switchMap(async ([{ path, trade }, tokens]) => {
    const fromWei = findOrThrow(
      tokens,
      (token) => token.dlt_id === trade.fromId,
      'failed finding from token in tokens observable'
    );

    // insert error handling here
  })
);

export const tx = {
  swap: function (fromId: string, toId: string, decAmount: string) {
    swapReceiver$.next({ fromId, toId, decAmount });
  },
};
