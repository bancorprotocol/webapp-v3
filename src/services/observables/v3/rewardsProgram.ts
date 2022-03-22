import { combineLatest } from 'rxjs';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { shareReplay } from 'rxjs/operators';
import { currentNetwork$ } from 'services/observables/network';
import {
  fetchAllRewardsPrograms,
  fetchProviderProgramStakes,
} from 'services/web3/v3/rewardsProgram/rewardsProgram';
import { user$ } from 'services/observables/user';

export const allRewardsPrograms$ = combineLatest([currentNetwork$]).pipe(
  switchMapIgnoreThrow(() => fetchAllRewardsPrograms()),
  shareReplay(1)
);

export const providerProgramStakes$ = combineLatest([
  user$,
  currentNetwork$,
]).pipe(
  switchMapIgnoreThrow(([user]) => fetchProviderProgramStakes(user)),
  shareReplay(1)
);
