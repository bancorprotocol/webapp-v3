import { combineLatest } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { fetchLockedAvailableBalances } from 'services/web3/lockedbnt/lockedbnt';
import { fetchProtectedPositions } from 'services/web3/protection/positions';
import { switchMapIgnoreThrow } from './customOperators';
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
  }),
  shareReplay(1)
);
