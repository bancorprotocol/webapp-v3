import { fetchPortfolioV3Withdrawals } from 'services/web3/v3/portfolio/withdraw';
import {
  setHoldingsRaw,
  setIsPortfolioLoading,
  setStandardRewards,
  setWithdrawalRequestsRaw,
} from 'store/portfolio/v3Portfolio';
import { fetchPortfolioV3Holdings } from 'services/web3/v3/portfolio/holdings';
import { updateUserBalances } from 'services/observables/tokens';
import { fetchStandardRewardsByUser } from 'services/web3/v3/portfolio/standardStaking';
import { take } from 'rxjs/operators';
import { apiPoolsV3$ } from 'services/observables/apiData';
import { user$ } from 'services/observables/user';
import { allpoolsV3$ } from 'services/observables/pools';

export const updatePortfolioData = async (dispatch: (data: any) => void) => {
  const account = await user$.pipe(take(1)).toPromise();
  const poolsV3 = await allpoolsV3$.pipe(take(1)).toPromise();

  if (!account) {
    return;
  }
  dispatch(setIsPortfolioLoading(true));
  const standardRewards = await fetchStandardRewardsByUser(account!, poolsV3);
  const apiPools = await apiPoolsV3$.pipe(take(1)).toPromise();
  const holdings = await fetchPortfolioV3Holdings(apiPools, account!);
  dispatch(setStandardRewards(standardRewards));
  dispatch(setHoldingsRaw(holdings));
  const requests = await fetchPortfolioV3Withdrawals(account!);
  dispatch(setWithdrawalRequestsRaw(requests));
  await updateUserBalances();
  dispatch(setIsPortfolioLoading(false));
};
