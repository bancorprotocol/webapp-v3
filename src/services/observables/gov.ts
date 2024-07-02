import { user$ } from './user';
import { shareReplay, switchMap } from 'rxjs/operators';
import {
  getStakedAmount,
  getUnstakeTimer,
} from 'services/web3/governance/governance';

export const stakedVbntAmount$ = user$.pipe(
  switchMap(async (user) => {
    if (user) return await getStakedAmount(user, false);
  }),
  shareReplay(1)
);

export const unstakeVbntTimer$ = user$.pipe(
  switchMap(async (user) => {
    if (user) return await getUnstakeTimer(user, false);
  }),
  shareReplay(1)
);

export const stakedBntAmount$ = user$.pipe(
  switchMap(async (user) => {
    if (user) return await getStakedAmount(user, true);
  }),
  shareReplay(1)
);

export const unstakeBntTimer$ = user$.pipe(
  switchMap(async (user) => {
    if (user) return await getUnstakeTimer(user, true);
  }),
  shareReplay(1)
);
