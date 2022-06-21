import { user$ } from './user';
import { shareReplay, switchMap } from 'rxjs/operators';
import {
  getStakedAmount,
  getUnstakeTimer,
} from 'services/web3/governance/governance';

export const stakedAmount$ = user$.pipe(
  switchMap(async (user) => {
    if (user) return await getStakedAmount(user);
  }),
  shareReplay(1)
);

export const unstakeTimer$ = user$.pipe(
  switchMap(async (user) => {
    if (user) return await getUnstakeTimer(user);
  }),
  shareReplay(1)
);
