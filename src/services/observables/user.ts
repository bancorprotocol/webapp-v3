import { BehaviorSubject, partition } from 'rxjs';
import { distinctUntilChanged, filter, shareReplay } from 'rxjs/operators';

const userReceiver$ = new BehaviorSubject<string>('');

export const user$ = userReceiver$.pipe(distinctUntilChanged(), shareReplay(1));

const [onLoginRaw$] = partition(user$, (user) => Boolean(user));

export const onLogin$ = onLoginRaw$.pipe(shareReplay(1));

export const setUser = (userAddress: string | undefined | null) => {
  if (typeof userAddress === 'string') {
    userReceiver$.next(userAddress);
  } else {
    userReceiver$.next('');
  }
};
