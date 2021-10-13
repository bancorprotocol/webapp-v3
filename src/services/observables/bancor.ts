import { combineLatest } from 'rxjs';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { shareReplay } from 'rxjs/operators';
import { apiData$ } from 'services/observables/pools';

export const bntPrice$ = combineLatest([apiData$]).pipe(
  switchMapIgnoreThrow(async ([apiData]) => {
    return apiData.bnt_price.usd;
  }),
  shareReplay(1)
);
