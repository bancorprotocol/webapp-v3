import { NavigateFunction } from 'react-router-dom';
import { BancorRoutes } from 'router/routes.service';
import { PageTradeQuery } from 'router/trade.routes';

export class GoToPage {
  constructor(navigate: NavigateFunction) {
    this.navigate = navigate;
  }

  private readonly navigate: NavigateFunction;

  index = (replace = false) => {
    const url = BancorRoutes.index;
    this.navigate(url, { replace });
  };

  earn = (replace = false) => {
    const url = BancorRoutes.earn;
    this.navigate(url, { replace });
  };

  tokens = (replace = false) => {
    const url = BancorRoutes.tokens;
    this.navigate(url, { replace });
  };

  portfolio = (replace = false) => {
    const url = BancorRoutes.portfolio;
    this.navigate(url, { replace });
  };

  portfolioV2 = (replace = false) => {
    const url = BancorRoutes.portfolioV2;
    this.navigate(url, { replace });
  };

  portfolioV2RewardsStake = (
    id: string,
    posGroupId?: string,
    replace = false
  ) => {
    const url = BancorRoutes.portfolioV2RewardsStake(id, posGroupId);
    this.navigate(url, { replace });
  };

  portfolioV2RewardsClaim = (replace = false) => {
    const url = BancorRoutes.portfolioV2RewardsClaim;
    this.navigate(url, { replace });
  };

  portfolioV1 = (replace = false) => {
    const url = BancorRoutes.portfolioV1;
    this.navigate(url, { replace });
  };

  trade = (query: PageTradeQuery, replace = false) => {
    const url = BancorRoutes.trade(query);
    this.navigate(url, { replace });
  };

  addLiquidityV2 = (id: string, replace = false) => {
    const url = BancorRoutes.addLiquidityV2(id);
    this.navigate(url, { replace });
  };

  vote = (replace = false) => {
    const url = BancorRoutes.vote;
    this.navigate(url, { replace });
  };

  fiat = (replace = false) => {
    const url = BancorRoutes.fiat;
    this.navigate(url, { replace });
  };

  termsOfUse = (replace = false) => {
    const url = BancorRoutes.termsOfUse;
    this.navigate(url, { replace });
  };

  privacyPolicy = (replace = false) => {
    const url = BancorRoutes.privacyPolicy;
    this.navigate(url, { replace });
  };

  admin = (replace = false) => {
    const url = BancorRoutes.admin;
    this.navigate(url, { replace });
  };

  notFound = (replace = false) => {
    const url = BancorRoutes.notFound;
    this.navigate(url, { replace });
  };
}
