import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { fetchAllStandardRewards } from 'services/web3/v3/portfolio/standardStaking';
import { shareReplay } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { ProgramDataStructOutput } from 'services/web3/abis/types/StandardRewards';

const standardRewardProgramsReceiver$ = new BehaviorSubject<
  ProgramDataStructOutput[]
>([]);

export const standardRewardPrograms$ = standardRewardProgramsReceiver$.pipe(
  switchMapIgnoreThrow(() => fetchAllStandardRewards()),
  shareReplay(1)
);
