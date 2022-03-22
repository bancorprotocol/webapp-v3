import { combineLatest } from 'rxjs';
import { user$ } from 'services/observables/user';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { shareReplay } from 'rxjs/operators';
import { fetchPortfolioV3Holdings } from 'services/web3/v3/portfolio/holdings';
import { ContractsApi } from 'services/web3/v3/contractsApi';

export const portfolioHoldings$ = combineLatest([user$]).pipe(
  switchMapIgnoreThrow(async ([user]) => {
    // TODO - get poolIds from API once available
    const poolIds = await ContractsApi.BancorNetwork.read.liquidityPools();
    return fetchPortfolioV3Holdings(poolIds, user);
  }),
  shareReplay(1)
);
