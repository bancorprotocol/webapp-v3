import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';
const userReceiver$ = new BehaviorSubject<string>('');
const balancesReceiver$ = new BehaviorSubject<boolean>(false);

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
