import { BehaviorSubject, combineLatest } from 'rxjs';
import { user$ } from 'services/observables/user';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { shareReplay } from 'rxjs/operators';
import { fetchPortfolioV3Holdings } from 'services/web3/v3/portfolio/holdings';
import {
  fetchPortfolioV3Withdrawals,
  fetchPortfolioV3WithdrawalSettings,
} from 'services/web3/v3/portfolio/withdraw';
import { WithdrawalSettings } from 'store/portfolio/v3Portfolio.types';
import {
  fetchAllStandardRewards,
  fetchStandardRewardsByUser,
} from 'services/web3/v3/portfolio/standardStaking';
import { ProgramDataStructOutput } from 'services/web3/abis/types/StandardRewards';
import { fifteenSeconds$ } from 'services/observables/timers';
import { apiPoolsV3$ } from 'services/observables/apiData';
import { tokensV3$ } from './tokens';

export const portfolioHoldings$ = combineLatest([
  apiPoolsV3$,
  user$,
  fifteenSeconds$,
]).pipe(
  switchMapIgnoreThrow(async ([apiPools, user]) => {
    return fetchPortfolioV3Holdings(apiPools, user);
  }),
  shareReplay(1)
);

export const portfolioStandardRewards$ = combineLatest([
  user$,
  tokensV3$,
  fifteenSeconds$,
]).pipe(
  switchMapIgnoreThrow(async ([user, tokensV3]) => {
    return fetchStandardRewardsByUser(user, tokensV3);
  }),
  shareReplay(1)
);

export const portfolioWithdrawals$ = combineLatest([
  user$,
  fifteenSeconds$,
]).pipe(
  switchMapIgnoreThrow(async ([user]) => {
    return fetchPortfolioV3Withdrawals(user);
  }),
  shareReplay(1)
);

const portfolioWithdrawalSettingsReceiver$ =
  new BehaviorSubject<WithdrawalSettings>({
    lockDuration: 0,
    withdrawalFee: 0,
  });

export const portfolioWithdrawalSettings$ =
  portfolioWithdrawalSettingsReceiver$.pipe(
    switchMapIgnoreThrow(() => fetchPortfolioV3WithdrawalSettings()),
    shareReplay(1)
  );

const portfolioAllStandardRewardsReceiver$ = new BehaviorSubject<
  ProgramDataStructOutput[]
>([]);

export const portfolioAllStandardRewards$ =
  portfolioAllStandardRewardsReceiver$.pipe(
    switchMapIgnoreThrow(() => fetchAllStandardRewards()),
    shareReplay(1)
  );
