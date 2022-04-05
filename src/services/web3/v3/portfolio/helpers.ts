import { fetchPortfolioV3Withdrawals } from 'services/web3/v3/portfolio/withdraw';
import {
  setHoldingsRaw,
  setWithdrawalRequestsRaw,
} from 'redux/portfolio/v3Portfolio';
import { fetchPortfolioV3Holdings } from 'services/web3/v3/portfolio/holdings';
import { updateUserBalances } from 'services/observables/tokens';

export const updatePortfolioData = async (
  dispatch: (data: any) => void,
  account: string
) => {
  const holdings = await fetchPortfolioV3Holdings(account!);
  dispatch(setHoldingsRaw(holdings));
  const requests = await fetchPortfolioV3Withdrawals(account!);
  dispatch(setWithdrawalRequestsRaw(requests));
  await updateUserBalances();
};
