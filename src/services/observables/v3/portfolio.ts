import { BehaviorSubject, combineLatest } from 'rxjs';
import { user$ } from 'services/observables/user';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { shareReplay } from 'rxjs/operators';
import { fetchPortfolioV3Holdings } from 'services/web3/v3/portfolio/holdings';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import {
  fetchPortfolioV3Withdrawals,
  fetchPortfolioV3WithdrawalSettings,
} from 'services/web3/v3/portfolio/withdraw';
import { WithdrawalSettings } from 'redux/portfolio/v3Portfolio.types';

export const portfolioHoldings$ = combineLatest([user$]).pipe(
  switchMapIgnoreThrow(async ([user]) => {
    // TODO - get poolIds from API once available
    const poolIds = await ContractsApi.BancorNetwork.read.liquidityPools();
    return fetchPortfolioV3Holdings(poolIds, user);
  }),
  shareReplay(1)
);

export const portfolioWithdrawals$ = combineLatest([user$]).pipe(
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
