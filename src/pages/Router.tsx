import { Swap } from 'pages/Swap';
import {
  Navigate,
  NavigateFunction,
  RouteObject,
  useNavigate,
  useRoutes,
} from 'react-router-dom';
import { Tokens } from 'pages/Tokens';
import { Portfolio } from 'pages/earn/portfolio/Portfolio';
import { Pools } from 'pages/earn/pools/Pools';
import { NotFound } from 'pages/NotFound';
import V3Portfolio from 'elements/earn/portfolio/v3/V3Portfolio';
import { LiquidityProtection } from 'elements/earn/portfolio/liquidityProtection/LiquidityProtection';
import { PoolTokens } from 'elements/earn/portfolio/poolTokens/PoolTokens';
import { AddLiquidity } from 'pages/earn/pools/AddLiquidity';
import { Fiat } from 'pages/Fiat';
import { Vote } from 'pages/Vote';
import { TermsOfUse } from 'pages/TermsOfUse';
import { PrivacyPolicy } from 'pages/PrivacyPolicy';
import { RewardsStake } from 'pages/earn/portfolio/rewards/RewardsStake';
import { RewardsClaim } from 'pages/earn/portfolio/rewards/RewardsClaim';

interface PageTradeQuery {
  from?: string;
  to?: string;
  limit?: boolean;
}

export abstract class BancorRoutes {
  static index = '/';
  static notFound = '/404';
  static admin = '/admin';
  static earn = '/earn';
  static tokens = '/tokens';
  static portfolio = '/portfolio';
  static portfolioV1 = this.portfolio + '/v1';
  static portfolioV2 = this.portfolio + '/v2';
  static portfolioV2RewardsStake = (id: string, posGroupId?: string) =>
    `${this.portfolioV2}/rewards/stake/${id}${
      posGroupId ? `?posGroupId=${posGroupId}` : ''
    }`;
  static portfolioV2RewardsClaim = this.portfolioV2 + '/rewards/claim';
  static vote = '/vote';
  static fiat = '/fiat';
  static termsOfUse = '/terms-of-use';
  static privacyPolicy = '/privacy-policy';

  static addLiquidityV2 = (id: string) => this.earn + '/add-liquidity/' + id;

  static trade = (query?: PageTradeQuery) => {
    const path = '/trade';

    const from = query?.from ? `from=${query.from}` : '';
    const to = query?.to ? `to=${query.to}` : '';
    const limit = query?.limit ? 'limit=true' : '';
    const search = [from, to, limit].filter((x) => !!x).join('&');

    return [path, search].filter((x) => !!x).join('?');
  };
}

class GoToPage {
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

export const usePages = () => {
  const goToPage = new GoToPage(useNavigate());

  return { goToPage };
};

export const Router = () => {
  let routes: RouteObject[] = [
    {
      path: BancorRoutes.index,
      element: <Navigate to={BancorRoutes.trade()} replace />,
    },
    {
      path: BancorRoutes.earn,
      element: <Pools />,
    },
    {
      path: BancorRoutes.trade(),
      element: <Swap />,
    },
    {
      path: BancorRoutes.tokens,
      element: <Tokens />,
    },
    {
      path: BancorRoutes.portfolio,
      element: <Portfolio />,
      children: [
        {
          index: true,
          element: <V3Portfolio />,
        },
        {
          path: BancorRoutes.portfolioV2,
          element: <LiquidityProtection />,
        },
        {
          path: BancorRoutes.portfolioV1,
          element: <PoolTokens />,
        },
      ],
    },
    {
      path: BancorRoutes.addLiquidityV2(':id'),
      element: <AddLiquidity />,
    },
    {
      path: BancorRoutes.portfolioV2RewardsStake(':id'),
      element: <RewardsStake />,
    },
    {
      path: BancorRoutes.portfolioV2RewardsClaim,
      element: <RewardsClaim />,
    },
    {
      path: BancorRoutes.fiat,
      element: <Fiat />,
    },
    {
      path: BancorRoutes.vote,
      element: <Vote />,
    },
    {
      path: BancorRoutes.termsOfUse,
      element: <TermsOfUse />,
    },
    {
      path: BancorRoutes.privacyPolicy,
      element: <PrivacyPolicy />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ];

  const element = useRoutes(routes);
  return <>{element}</>;
};
