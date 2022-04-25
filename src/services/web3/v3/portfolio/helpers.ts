import { fetchPortfolioV3Withdrawals } from 'services/web3/v3/portfolio/withdraw';
import {
  setHoldingsRaw,
  setStandardRewards,
  setWithdrawalRequestsRaw,
} from 'store/portfolio/v3Portfolio';
import { fetchPortfolioV3Holdings } from 'services/web3/v3/portfolio/holdings';
import { updateUserBalances } from 'services/observables/tokens';
import { fetchStandardRewardsByUser } from 'services/web3/v3/portfolio/standardStaking';

export const updatePortfolioData = async (
  dispatch: (data: any) => void,
  account: string
) => {
  const standardRewards = await fetchStandardRewardsByUser(account!);
  dispatch(setStandardRewards(standardRewards));
  const holdings = await fetchPortfolioV3Holdings(account!);
  dispatch(setHoldingsRaw(holdings));
  const requests = await fetchPortfolioV3Withdrawals(account!);
  dispatch(setWithdrawalRequestsRaw(requests));
  await updateUserBalances();
};
