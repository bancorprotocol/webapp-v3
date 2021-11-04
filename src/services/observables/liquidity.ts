import { BigNumber } from 'bignumber.js';
import { combineLatest } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { fetchLockedAvailableBalances } from 'services/web3/lockedbnt/lockedbnt';
import { fetchProtectedPositions } from 'services/web3/protection/positions';
import {
  fetchPendingRewards,
  fetchTotalClaimedRewards,
} from 'services/web3/protection/rewards';
import { switchMapIgnoreThrow } from './customOperators';
import { fifteenSeconds$ } from './timers';
import { pools$ } from './tokens';
import { user$ } from './user';

export const lockedAvailableBnt$ = combineLatest([user$]).pipe(
  switchMapIgnoreThrow(async ([user]) => {
    if (user) return await fetchLockedAvailableBalances(user);
  }),
  shareReplay(1)
);

export const protectedPositions$ = combineLatest([pools$, user$]).pipe(
  switchMapIgnoreThrow(async ([pools, user]) => {
    if (user) return await fetchProtectedPositions(pools, user);

    return [];
  }),
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

      return {
        pendingRewards,
        totalRewards,
      };
    }
  }),
  shareReplay(1)
);
