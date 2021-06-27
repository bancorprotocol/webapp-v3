import { BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';

const userReceiver$ = new BehaviorSubject<string>('');
const onLogoutReceiver$ = new Subject<boolean>();

//const onLogout$ = onLogoutReceiver$.pipe(distinctUntilChanged());

export const user$ = userReceiver$.pipe(distinctUntilChanged(), shareReplay(1));

export const setUser = (userAddress: string | undefined | null) => {
  if (typeof userAddress === 'string') {
    userReceiver$.next(userAddress);
  } else {
    onLogoutReceiver$.next(true);
  }
};
