import { combineLatest, Observable, Subject } from 'rxjs';
import { optimisticObservable, switchMapIgnoreThrow } from './customOperators';
import {
  fetchProtectedPositions,
  fetchPositionIds,
  removeLiquidityReturn,
  uniquePoolReserves,
  ProtectedLiquidity,
  buildLiquidityProtectionContract,
} from 'services/web3/contracts/liquidityProtection/wrapper';
import {
  liquidityProtection$,
  liquidityProtectionStore$,
  stakingRewards$,
  storeRewards$,
} from './contracts';
import { currentNetwork$ } from './network';
import { map, shareReplay, startWith, withLatestFrom } from 'rxjs/operators';
import { onLogin$, user$ } from './user';
import {
  findOrThrow,
  mapIgnoreThrown,
  partitionPair,
} from 'utils/pureFunctions';
import {
  fetchRewardsMultiplier,
  pendingRewardRewards,
  positionMatchesReward,
} from 'services/web3/contracts/stakingRewards/wrapper';
import { fetchPoolPrograms } from 'services/web3/contracts/stakingRewardsStore/wrapper';
import { BigNumber } from 'bignumber.js';
import { currentBlock$ } from './currentBlock';
import { pools$ } from './pools';
import { Pool } from 'services/api/bancor';
import { rewindBlocksByDays } from 'utils/helperFunctions';
import { uniq } from 'lodash';
import {
  fetchPoolOwner,
  fetchTokenSupply,
} from 'services/web3/contracts/token/wrapper';
import { fetchPoolReserveBalances } from 'services/web3/contracts/converter/wrapper';

const positionIds$ = combineLatest([liquidityProtectionStore$, user$]).pipe(
  optimisticObservable('positionIds', ([store, user]) =>
    fetchPositionIds(user, store)
  )
);

const fetchPositionsTriggerRaw$ = new Subject<true>();

const fetchPositionsTrigger$ = fetchPositionsTriggerRaw$.pipe(
  startWith(true),
  shareReplay(1)
);

export const fetchPositions = () => fetchPositionsTriggerRaw$.next(true);

export const positions$ = combineLatest([
  positionIds$,
  liquidityProtectionStore$,
  currentNetwork$,
  fetchPositionsTrigger$,
]).pipe(
  switchMapIgnoreThrow(([ids, protectionStore, network]) =>
    fetchProtectedPositions(ids, protectionStore, network)
  )
);

interface ObjectWithId {
  id: string;
  [key: string]: any;
}

const spreadById = <T extends ObjectWithId, Y extends ObjectWithId>(
  primaryObservable: Observable<Y[]>,
  optionalObservables: Observable<any[]>[]
) => {
  return combineLatest([
    primaryObservable,
    ...optionalObservables.map((obs) => obs.pipe(startWith({}))),
  ]).pipe(
    map((observables) => {
      const [primary, ...optionals] = observables as [Y[], ...T[]];

      const flattened = optionals.flat(1);

      return primary.map((obj) => {
        const objectsToMerge = flattened.filter((o) => o.id === obj.id);
        return objectsToMerge.reduce((acc, item) => ({ ...acc, ...item }), obj);
      });
    })
  );
};

const removeLiquidityReturn$ = combineLatest([
  positions$,
  liquidityProtection$,
]).pipe(
  switchMapIgnoreThrow(([positions, contract]) =>
    mapIgnoreThrown(positions, (position) =>
      removeLiquidityReturn(position, contract)
    )
  )
);

const pendingReserveRewards$ = combineLatest([
  stakingRewards$,
  positions$,
  onLogin$,
]).pipe(
  switchMapIgnoreThrow(async ([stakingRewards, positions, currentUser]) => {
    const uniquePoolReserveIds = uniquePoolReserves(positions);

    const pendingReserveRewards = await mapIgnoreThrown(
      uniquePoolReserveIds,
      (poolReserve) =>
        pendingRewardRewards(
          stakingRewards,
          currentUser,
          poolReserve.poolToken,
          poolReserve.reserveToken
        )
    );

    const fulfilledPositions = positions.filter((position) =>
      pendingReserveRewards.some(positionMatchesReward(position))
    );

    return fulfilledPositions.map((position) => {
      const reward = findOrThrow(
        pendingReserveRewards,
        positionMatchesReward(position)
      );

      return {
        id: position.id,
        pendingReserveReward: reward.decBnt.toString(),
      };
    });
  })
);

export const poolPrograms$ = storeRewards$.pipe(
  switchMapIgnoreThrow((storeRewardContract) =>
    fetchPoolPrograms(storeRewardContract)
  ),
  shareReplay(1)
);

const rewardMultipliers$ = combineLatest([
  positions$,
  onLogin$,
  stakingRewards$,
]).pipe(
  switchMapIgnoreThrow(([positions, currentUser, stakingReward]) => {
    const poolReserves = uniquePoolReserves(positions);
    return mapIgnoreThrown(poolReserves, async (poolReserve) => {
      return {
        ...poolReserve,
        multiplier: await fetchRewardsMultiplier(
          poolReserve.poolToken,
          poolReserve.reserveToken,
          stakingReward,
          currentUser
        ).catch(() => new BigNumber(0)),
      };
    });
  })
);

const rewardMultiplier$ = combineLatest([
  positions$,
  poolPrograms$,
  rewardMultipliers$,
]).pipe(
  map(([positions, poolPrograms, rewards]) => {
    return positions.map((position) => {
      const hasPoolProgram = poolPrograms.some(
        (program) => program.poolToken === position.poolToken
      );

      const reward = rewards.find(
        (reward) => reward.poolToken === position.poolToken
      );
      return {
        id: position.id,
        rewardsMultiplier:
          hasPoolProgram && reward ? reward.multiplier.toNumber() : 0,
      };
    });
  })
);

export interface TimeScale {
  blockHeight: number;
  days: number;
  label: string;
}

export interface PoolHistoricBalance {
  scale: TimeScale;
  pool: Pool;
  smartTokenSupply: string;
  reserveBalances: {
    contract: string;
    weiAmount: string;
  }[];
}

export const fetchHistoricBalances = async (
  timeScales: TimeScale[],
  pools: Pool[]
): Promise<PoolHistoricBalance[]> => {
  const atLeastOneAnchorAndScale = timeScales.length > 0 && pools.length > 0;
  if (!atLeastOneAnchorAndScale)
    throw new Error('Must pass at least one time scale and anchor');
  const res = await Promise.all(
    timeScales.map((scale) =>
      Promise.all(
        pools.map(async (pool) => {
          const blockHeight = scale.blockHeight;
          let smartTokenSupply: string | undefined;
          try {
            smartTokenSupply = await fetchTokenSupply(
              pool.pool_dlt_id,
              blockHeight
            );
          } catch (e) {
            console.error('Failed to fetch token supply.', e);
          }

          let reserveBalances:
            | { weiAmount: string; contract: string }[]
            | undefined;
          try {
            reserveBalances = await fetchPoolReserveBalances(pool, blockHeight);
          } catch (e) {
            console.log('trying to fetch previous owner..');
            try {
              const previousOwner = await fetchPoolOwner(
                pool.pool_dlt_id,
                blockHeight
              );

              const oldPool: Pool = {
                ...pool,
                converter_dlt_id: previousOwner,
              };
              reserveBalances = await fetchPoolReserveBalances(
                oldPool,
                blockHeight
              );
            } catch (e) {
              console.error('Failed to fetch Relay Reserve Balances.', e, pool);
            }
          }
          return {
            scale,
            pool,
            smartTokenSupply,
            reserveBalances,
          };
        })
      )
    )
  );
  // @ts-ignore
  return res.map((scaleSet) =>
    scaleSet.filter((set) => set.reserveBalances && set.smartTokenSupply)
  ) as PoolHistoricBalance[];
};

export const getHistoricBalances = async (
  positions: ProtectedLiquidity[],
  blockNow: number,
  pools: Pool[]
): Promise<PoolHistoricBalance[][]> => {
  const timeScales: TimeScale[] = (
    [
      [1, 'day'],
      [7, 'week'],
    ] as [number, string][]
  ).map(([days, label]) => ({
    blockHeight: rewindBlocksByDays(blockNow, days),
    days,
    label,
  }));
  const uniqueAnchors = uniq(positions.map((pos) => pos.poolToken));
  const relevantPools = pools.filter((pool) =>
    uniqueAnchors.some((anchor) => pool.pool_dlt_id === anchor)
  );
  // @ts-ignore
  return fetchHistoricBalances(timeScales, relevantPools);
};

export const getPoolAprs = async (
  positions: ProtectedLiquidity[],
  historicBalances: PoolHistoricBalance[],
  liquidityProtectionContract: string
) => {
  try {
    const res = await Promise.all(
      positions.map((position) =>
        Promise.all(
          historicBalances
            .filter(
              (historicBalance) =>
                historicBalance.pool.pool_dlt_id === position.poolToken
            )
            .map(async (historicBalance) => {
              const poolTokenSupply = historicBalance.smartTokenSupply;

              const [tknReserveBalance, opposingTknBalance] = partitionPair(
                historicBalance.reserveBalances,
                (balance) => balance.contract === position.reserveToken
              );

              const poolToken = position.poolToken;
              const reserveToken = position.reserveToken;
              const reserveAmount = position.reserveAmount;
              const poolRateN = new BigNumber(tknReserveBalance.weiAmount)
                .times(2)
                .toString();
              const poolRateD = poolTokenSupply;

              const reserveRateN = opposingTknBalance.weiAmount;
              const reserveRateD = tknReserveBalance.weiAmount;

              let poolRoi = '';
              const lpContract = buildLiquidityProtectionContract(
                liquidityProtectionContract
              );

              try {
                poolRoi = await lpContract.methods
                  .poolROI(
                    poolToken,
                    reserveToken,
                    reserveAmount,
                    poolRateN,
                    poolRateD,
                    reserveRateN,
                    reserveRateD
                  )
                  .call();
              } catch (err) {
                console.error('getting pool roi failed!', err, {
                  address: liquidityProtectionContract,
                  poolToken,
                  reserveToken,
                  reserveAmount,
                  poolRateN,
                  poolRateD,
                  reserveRateN,
                  reserveRateD,
                });
              }

              const scale = historicBalance.scale;
              const magnitude =
                scale.label === 'day'
                  ? 365
                  : scale.label === 'week'
                  ? 52
                  : 365 / scale.days;

              const calculatedAprDec = new BigNumber(poolRoi)
                .div(1000000)
                .minus(1)
                .times(magnitude);

              return {
                calculatedAprDec: calculatedAprDec.isNegative()
                  ? '0'
                  : calculatedAprDec.toString(),
                id: position.id,
                scaleId: historicBalance.scale.label,
              };
            })
        )
      )
    );
    return res;
  } catch (e) {
    throw new Error(`Failed fetching pool aprs ${e}`);
  }
};

const historicPoolBalances$ = combineLatest([positions$, pools$]).pipe(
  withLatestFrom(currentBlock$),
  switchMapIgnoreThrow(([[positions, pools], block]) =>
    getHistoricBalances(positions, block.currentBlock, pools)
  )
);

const poolAprs$ = combineLatest([
  positions$,
  historicPoolBalances$,
  liquidityProtection$,
]).pipe(
  switchMapIgnoreThrow(([positions, poolBalances, liquidityProtection]) =>
    getPoolAprs(positions, poolBalances.flat(), liquidityProtection)
  )
);

const poolReturns$ = combineLatest([positions$, poolAprs$]).pipe(
  map(([positions, aprs]) => {
    return positions.map((position) => {
      const scales = aprs.find((apr) => apr.find((x) => x.id === position.id));
      const week = scales && scales.find((scale) => scale.scaleId === 'week');
      const day = scales && scales.find((scale) => scale.scaleId === 'day');
      return {
        id: position.id,
        ...(day && { oneDayDec: day.calculatedAprDec }),
        ...(week && { oneWeekDec: week.calculatedAprDec }),
      };
    });
  })
);

export const fullPositions$ = spreadById(positions$, [
  removeLiquidityReturn$,
  pendingReserveRewards$,
  rewardMultiplier$,
  poolReturns$,
]);
