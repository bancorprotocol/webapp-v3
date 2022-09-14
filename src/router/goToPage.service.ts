import { NavigateFunction } from 'react-router-dom';
import { BancorURL } from 'router/bancorURL.service';
import { PageTradeQuery } from 'router/useRoutesTrade';

export class GoToPage {
  constructor(navigate: NavigateFunction) {
    this.navigate = navigate;
  }

  private readonly navigate: NavigateFunction;

  index = (replace = false) => {
    const url = BancorURL.index;
    this.navigate(url, { replace });
  };

  welcome = (replace = false) => {
    const url = BancorURL.welcome;
    this.navigate(url, { replace });
  };

  earn = (replace = false) => {
    const url = BancorURL.earn;
    this.navigate(url, { replace });
  };

  earnV2 = (replace = false) => {
    const url = BancorURL.earnV2;
    this.navigate(url, { replace });
  };

  tokens = (replace = false) => {
    const url = BancorURL.tokens;
    this.navigate(url, { replace });
  };

  portfolio = (replace = false) => {
    const url = BancorURL.portfolio;
    this.navigate(url, { replace });
  };

  portfolioV2 = (replace = false) => {
    const url = BancorURL.portfolioV2;
    this.navigate(url, { replace });
  };

  portfolioV2RewardsStake = (
    id: string,
    posGroupId?: string,
    replace = false
  ) => {
    const url = BancorURL.portfolioV2RewardsStake(id, posGroupId);
    this.navigate(url, { replace });
  };

  portfolioHolding = (pool: string, replace = false) => {
    const url = BancorURL.portfolioHolding(pool);
    this.navigate(url, { replace });
  };

  portfolioV2RewardsClaim = (replace = false) => {
    const url = BancorURL.portfolioV2RewardsClaim;
    this.navigate(url, { replace });
  };

  portfolioV1 = (replace = false) => {
    const url = BancorURL.portfolioV1;
    this.navigate(url, { replace });
  };

  trade = (query: PageTradeQuery, replace = false) => {
    const url = BancorURL.trade(query);
    this.navigate(url, { replace });
  };

  addLiquidityV2 = (id: string, replace = false) => {
    const url = BancorURL.addLiquidityV2(id);
    this.navigate(url, { replace });
  };

  vote = (replace = false) => {
    const url = BancorURL.vote;
    this.navigate(url, { replace });
  };

  fiat = (replace = false) => {
    const url = BancorURL.fiat;
    this.navigate(url, { replace });
  };

  termsOfUse = (replace = false) => {
    const url = BancorURL.termsOfUse;
    this.navigate(url, { replace });
  };

  privacyPolicy = (replace = false) => {
    const url = BancorURL.privacyPolicy;
    this.navigate(url, { replace });
  };

  admin = (replace = false) => {
    const url = BancorURL.admin;
    this.navigate(url, { replace });
  };

  notFound = (replace = false) => {
    const url = BancorURL.notFound;
    this.navigate(url, { replace });
  };
}
