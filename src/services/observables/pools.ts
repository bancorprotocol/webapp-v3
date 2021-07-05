import {
  getWelcomeData,
  Pool,
  APIToken,
  WelcomeData,
} from 'services/api/bancor';
import { chunk, isEqual, partition, uniq, uniqBy, uniqWith, zip } from 'lodash';
import { combineLatest, Observable, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  first,
  map,
  pluck,
  share,
  shareReplay,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { ConverterAndAnchor } from 'services/web3/types';
import { bancorConverterRegistry$, bancorNetwork$ } from './contracts';
import { switchMapIgnoreThrow } from './customOperators';
import { currentNetwork$ } from './network';
import { fifteenSeconds$ } from './timers';
import {
  getAnchors,
  getConvertersByAnchors,
} from 'services/web3/contracts/converterRegistry/wrapper';
import { web3 } from 'services/web3/contracts';
import { toChecksumAddress } from 'web3-utils';
import {
  expandToken,
  findOrThrow,
  mapIgnoreThrown,
  shrinkToken,
  updateArray,
} from 'utils/pureFunctions';
import { getRateByPath } from 'services/web3/contracts/network/wrapper';
import { ContractSendMethod } from 'web3-eth-contract';
import { toHex } from 'web3-utils';
import wait from 'waait';

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

export const apiData$ = combineLatest([currentNetwork$, fifteenSeconds$]).pipe(
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
  startWith([] as ConverterAndAnchor[]),
  shareReplay(1)
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

const hasTokenId = (tokenAddress: string) => (token: APIToken) =>
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

const rate$ = tradeAndPath$.pipe(
  withLatestFrom(apiTokens$, bancorNetwork$),
  switchMapIgnoreThrow(async ([trade, tokens, networkContractAddress]) => {
    const fromToken = findOrThrow(tokens, hasTokenId(trade.trade.fromId));
    const toToken = findOrThrow(tokens, hasTokenId(trade.trade.toId));

    const fromWei = expandToken(trade.trade.decAmount, fromToken.decimals);
    const expectedReturnWei = await getRateByPath({
      networkContractAddress,
      amount: fromWei,
      path: trade.path.map((pool) => pool.anchorAddress),
      web3,
    });
    const expectedReturnDec = shrinkToken(expectedReturnWei, toToken.decimals);

    return expectedReturnDec;
  })
);

// create an observable that processes a transaction
// first emission is hash
// second emission completes with hash?

const txFactory = ({
  tx,
  gas,
  value,
  currentUser,
}: {
  tx: ContractSendMethod;
  gas?: number;
  value?: string;
  currentUser: string;
}): Observable<string> => {
  let adjustedGas: number | false = false;

  return new Observable((subscriber) => {
    tx.send({
      from: currentUser,
      ...(adjustedGas && { gas: adjustedGas as number }),
      ...(value && { value: toHex(value) }),
    })
      .on('transactionHash', (hash: string) => {
        subscriber.next(hash);
      })
      .on('confirmation', (confirmationNumber: number) => {
        subscriber.complete();
      })
      .on('error', subscriber.error);
  });
};

const unlimitedApprovalReceiver$ = new Subject<boolean>();

const unlimitedApprove = (unlimitedApprove: boolean) =>
  unlimitedApprovalReceiver$.next(unlimitedApprove);

interface TxStatus {
  status: string;
  error: string;
  success: string;
  queryUnlimitedApprove: boolean;
}

const txStatusReceiver$ = new Subject<TxStatus>();

const txStatus$ = txStatusReceiver$.pipe(
  distinctUntilChanged(),
  shareReplay(1)
);
//
// const approvalFactory = async ({
//   owner,
//   amount,
//   spender,
//   tokenAddress,
// }: {
//   owner: string;
//   amount: string;
//   spender: string;
//   tokenAddress: string;
// }) => {
//   if (tokenAddress === ethToken) return new Observable((sub) => sub.complete());
//
//   const isApprovalRequired = await getApprovalRequired(
//     owner,
//     spender,
//     amount,
//     tokenAddress
//   );
//
//   if (!isApprovalRequired) {
//     return new Observable((sub) => sub.complete());
//   }
//
//   const tokenContract = buildTokenContract(tokenAddress, web3);
//
//   // tokenContract.methods.approve();
// };

// const swapTx$ = tradeAndPath$.pipe(
//   tap(() =>
//     txStatusReceiver$.next({
//       error: '',
//       queryUnlimitedApprove: false,
//       status: 'Loading...',
//       success: '',
//     })
//   ),
//   withLatestFrom(apiTokens$, bancorNetwork$, user$),
//   switchMap(
//     async ([{ path, trade }, tokens, networkContractAddress, currentUser]) => {
//       const fromToken = findOrThrow(tokens, hasTokenId(trade.fromId));
//       const fromWei = expandToken(trade.decAmount, fromToken.decimals);
//
//       // insert error handling here
//       const isApprovalRequired = await getApprovalRequired(
//         currentUser,
//         networkContractAddress,
//         fromWei,
//         fromToken.dlt_id
//       );
//       if (isApprovalRequired) {
//         txStatusReceiver$.next({
//           queryUnlimitedApprove: true,
//           success: '',
//           status: 'UnlimitedApprove',
//           error: '',
//         });
//         const unlimitedApprove = await unlimitedApprovalReceiver$
//           .pipe(first())
//           .toPromise();
//       }
//     }
//   )
// );

export const tx = {
  swap: function (fromId: string, toId: string, decAmount: string) {
    swapReceiver$.next({ fromId, toId, decAmount });
  },
};

type Node = string;
type Edge = [string, string];
type AdjacencyList = Map<string, string[]>;

const buildAdjacencyList = (edges: Edge[], nodes: Node[]): AdjacencyList => {
  const adjacencyList = new Map();
  nodes.forEach((node) => adjacencyList.set(node, []));
  edges.forEach(([from, to]) => adjacencyList.get(from).push(to));
  edges.forEach(([from, to]) => adjacencyList.get(to).push(from));
  return adjacencyList;
};

const compareEdge = (edge1: Edge, edge2: Edge) =>
  edge1.every((edge) => edge2.some((e) => edge === e));

const dfs = (
  fromId: string,
  toId: string,
  adjacencyList: AdjacencyList
): Promise<string[]> =>
  new Promise((resolve) => callbackDfs(fromId, toId, adjacencyList, resolve));

const callbackDfs = (
  start: string,
  goal: string,
  adjacencyList: AdjacencyList,
  callBack: (stuff: any) => void,
  visited = new Set(),
  path: string[] = [start]
) => {
  visited.add(start);
  const destinations = adjacencyList.get(start)!;
  if (destinations.includes(goal)) {
    callBack([...path, goal]);
  }
  for (const destination of destinations) {
    if (!visited.has(destination)) {
      callbackDfs(destination, goal, adjacencyList, callBack, visited, [
        ...path,
        destination,
      ]);
    }
  }
};

async function findNewPath<T>(
  fromId: string,
  toId: string,
  pools: T[],
  identifier: (pool: T) => Edge
) {
  await wait(1000).then(() => {
    throw new Error('Failed finding path within timeout');
  });
  const edges = uniqWith(pools.map(identifier), compareEdge);
  const nodes: Node[] = uniq(edges.flat(1));

  const adjacencyList = buildAdjacencyList(edges, nodes);
  const startExists = adjacencyList.get(fromId);
  const goalExists = adjacencyList.get(toId);

  if (!(startExists && goalExists))
    throw new Error(
      `Start ${fromId} or goal ${toId} does not exist in adjacency list`
    );

  const dfsResult = await dfs(fromId, toId, adjacencyList)!;
  if (!dfsResult || dfsResult.length === 0)
    throw new Error('Failed to find path');

  const hops = chunk(dfsResult, 2).map((tokenIds, index, arr) => {
    let searchAbleIds: string[];

    if (tokenIds.length < 2) {
      searchAbleIds = [arr[index - 1][1], tokenIds[0]];
    } else searchAbleIds = tokenIds;

    const accomodatingRelays = pools.filter((pool) => {
      const ids = identifier(pool);
      return ids.every((id) => searchAbleIds.some((i) => id === i));
    });

    return accomodatingRelays;
  });

  return {
    path: dfsResult,
    hops,
  };
}
