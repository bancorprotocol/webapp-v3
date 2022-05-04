import { combineLatest } from 'rxjs';
import { fifteenSeconds$ } from 'services/observables/timers';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { distinctUntilChanged, pluck, shareReplay } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { BancorApi } from 'services/api/bancorApi/bancorApi';
import {
  APIPoolV3,
  APITokenV3,
  WelcomeData,
} from 'services/api/bancorApi/bancorApi.types';

export const apiData$ = combineLatest([fifteenSeconds$]).pipe(
  switchMapIgnoreThrow(() => BancorApi.v2.getWelcome()),
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

export const apiPoolsV3$ = combineLatest([fifteenSeconds$]).pipe(
  switchMapIgnoreThrow(() => BancorApi.v3.getPools()),
  distinctUntilChanged<APIPoolV3[]>(isEqual),
  shareReplay(1)
);

export const apiTokensV3$ = combineLatest([fifteenSeconds$]).pipe(
  switchMapIgnoreThrow(() => BancorApi.v3.getTokens()),
  distinctUntilChanged<APITokenV3[]>(isEqual),
  shareReplay(1)
);
