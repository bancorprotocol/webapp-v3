import { combineLatest, Observable, of, Subject } from 'rxjs';
import { optimisticObservable, switchMapIgnoreThrow } from './customOperators';
import {
  fetchProtectedPositions,
  fetchPositionIds,
} from 'services/web3/contracts/liquidityProtection/wrapper';
import { liquidityProtectionStore$ } from './contracts';
import { currentNetwork$ } from './network';
import { delay, map, shareReplay, startWith, tap } from 'rxjs/operators';
import { user$ } from './user';

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
  ),
  map((positions) => {
    return positions;
  })
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

export const fullPositions$ = spreadById(positions$, [
  of([{ id: '26296', cat: 5 }]),
  of([{ id: '26296', dog: 2020 }]),
]);
