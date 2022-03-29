import { combineLatest } from 'rxjs';
import { fifteenSeconds$ } from 'services/observables/timers';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { getWelcomeData, WelcomeData } from 'services/api/bancor';
import { distinctUntilChanged, pluck, shareReplay } from 'rxjs/operators';
import { isEqual } from 'lodash';

export const apiData$ = combineLatest([fifteenSeconds$]).pipe(
  switchMapIgnoreThrow(() => getWelcomeData()),
  distinctUntilChanged<WelcomeData>(isEqual),
  shareReplay(1)
);

export const apiTokens$ = apiData$.pipe(
  pluck('tokens'),
  distinctUntilChanged<WelcomeData['tokens']>(isEqual),
  shareReplay(1)
);

export const apiPools$ = apiData$.pipe(
  pluck('pools'),
  distinctUntilChanged<WelcomeData['pools']>(isEqual),
  shareReplay(1)
);

export const apiPoolsV3$ = apiData$.pipe(
  pluck('poolsV3'),
  distinctUntilChanged<WelcomeData['poolsV3']>(isEqual),
  shareReplay(1)
);
