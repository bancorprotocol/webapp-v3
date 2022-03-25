import { combineLatest } from 'rxjs';
import { fifteenSeconds$ } from 'services/observables/timers';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { getWelcomeData } from 'services/api/bancor';
import { shareReplay } from 'rxjs/operators';

export const apiData$ = combineLatest([fifteenSeconds$]).pipe(
  switchMapIgnoreThrow(() => getWelcomeData()),
  shareReplay(1)
);
