import { Observable, Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { switchMapIgnoreThrow } from './customOperators';
import { intoTheBlockByToken } from 'services/api/intoTheBlock';

const fromTokenReceiver$ = new Subject<string>();
const toTokenReceiver$ = new Subject<string>();

const fromSymbol$ = fromTokenReceiver$.pipe(shareReplay(1));
const toSymbol$ = toTokenReceiver$.pipe(shareReplay(1));

export const fetchFromToken = (symbol: string) =>
  fromTokenReceiver$.next(symbol);
export const fetchToToken = (symbol: string) => toTokenReceiver$.next(symbol);

const blockFactory = (observable: Observable<string>) =>
  observable.pipe(
    switchMapIgnoreThrow((symbol) => intoTheBlockByToken(symbol)),
    shareReplay(1)
  );

export const fromTokenIntoTheBlock$ = blockFactory(fromSymbol$);
export const toTokenIntoTheBlock$ = blockFactory(toSymbol$);
