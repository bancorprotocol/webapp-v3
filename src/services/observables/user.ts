import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';
const userReceiver$ = new BehaviorSubject<string>('');
const balancesReceiver$ = new BehaviorSubject<boolean>(false);
const positionsReceiver$ = new BehaviorSubject<boolean>(false);
const rewardsReceiver$ = new BehaviorSubject<boolean>(false);
const lockedBntReceiver$ = new BehaviorSubject<boolean>(false);

export const user$ = userReceiver$.pipe(distinctUntilChanged(), shareReplay(1));

export const setUser = (userAddress: string | undefined | null) => {
  if (typeof userAddress === 'string') userReceiver$.next(userAddress);
  else userReceiver$.next('');
};

export const loadingBalances$ = balancesReceiver$.pipe(
  distinctUntilChanged(),
  shareReplay(1)
);

export const setLoadingBalances = (loading: boolean) => {
  balancesReceiver$.next(loading);
};

export const loadingPositions$ = positionsReceiver$.pipe(
  distinctUntilChanged(),
  shareReplay(1)
);

export const setLoadingPositions = (loading: boolean) => {
  positionsReceiver$.next(loading);
};

export const loadingRewards$ = rewardsReceiver$.pipe(
  distinctUntilChanged(),
  shareReplay(1)
);

export const setLoadingRewards = (loading: boolean) => {
  rewardsReceiver$.next(loading);
};

export const loadingLockedBnt$ = lockedBntReceiver$.pipe(
  distinctUntilChanged(),
  shareReplay(1)
);

export const setLoadingLockedBnt = (loading: boolean) => {
  lockedBntReceiver$.next(loading);
};
