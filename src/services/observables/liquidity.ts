import { BigNumber } from 'bignumber.js';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { fetchLockedAvailableBalances } from 'services/web3/lockedbnt/lockedbnt';
import {
  fetchProtectedPositions,
  ProtectedPosition,
} from 'services/web3/protection/positions';
import {
  fetchPendingRewards,
  fetchTotalClaimedRewards,
} from 'services/web3/protection/rewards';
import { switchMapIgnoreThrow } from './customOperators';
import { fifteenSeconds$ } from './timers';
import {
  setLoadingPositions,
  setLoadingRewards,
  setLoadingLockedBnt,
  user$,
} from './user';
import { poolsNew$ } from 'services/observables/pools';
import { isEqual } from 'lodash';

export const protectedPositions$ = combineLatest([poolsNew$, user$]).pipe(
  switchMapIgnoreThrow(async ([pools, user]) => {
    if (user) {
      const positions = await fetchProtectedPositions(pools, user);
      setLoadingPositions(false);
      return positions;
    }

    setLoadingPositions(false);

    return [];
  }),
  distinctUntilChanged<ProtectedPosition[]>(isEqual),
  shareReplay(1)
);

export interface Rewards {
  pendingRewards: string;
  totalRewards: string;
}

export const rewards$ = combineLatest([user$, fifteenSeconds$]).pipe(
  switchMapIgnoreThrow(async ([user, _]) => {
    if (user) {
      const pendingRewards = await fetchPendingRewards(user);
      const claimedRewards = await fetchTotalClaimedRewards(user);

      const totalRewards = new BigNumber(pendingRewards)
        .plus(claimedRewards)
        .toString();

      setLoadingRewards(false);

      return {
        pendingRewards,
        totalRewards,
      };
    }
    setLoadingRewards(false);
  }),
  distinctUntilChanged<Rewards | undefined>(isEqual),
  shareReplay(1)
);

export const lockedAvailableBnt$ = combineLatest([user$]).pipe(
  switchMapIgnoreThrow(async ([user]) => {
    if (user) {
      setLoadingRewards(true);
      setLoadingPositions(true);
      setLoadingLockedBnt(true);
      const lockedAvailableBalances = await fetchLockedAvailableBalances(user);
      setLoadingLockedBnt(false);
      return lockedAvailableBalances;
    }
    setLoadingLockedBnt(false);
  }),
  shareReplay(1)
);
