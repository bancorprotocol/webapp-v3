import { combineLatest, Observable, of, Subject } from 'rxjs';
import {
  logger,
  optimisticObservable,
  switchMapIgnoreThrow,
} from './customOperators';
import {
  fetchProtectedPositions,
  fetchPositionIds,
  removeLiquidityReturn,
  uniquePoolReserves,
} from 'services/web3/contracts/liquidityProtection/wrapper';
import {
  liquidityProtection$,
  liquidityProtectionStore$,
  stakingRewards$,
  storeRewards$,
} from './contracts';
import { currentNetwork$ } from './network';
import { map, shareReplay, startWith, tap } from 'rxjs/operators';
import { onLogin$, user$ } from './user';
import { findOrThrow, mapIgnoreThrown } from 'utils/pureFunctions';
import {
  fetchRewardsMultiplier,
  pendingRewardRewards,
  positionMatchesReward,
} from 'services/web3/contracts/stakingRewards/wrapper';
import { fetchPoolPrograms } from 'services/web3/contracts/stakingRewardsStore/wrapper';
import { BigNumber } from 'bignumber.js';

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

export const fullPositions$ = spreadById(positions$, [
  removeLiquidityReturn$,
  pendingReserveRewards$,
  rewardMultiplier$,
]);
