import { Navigate, RouteObject } from 'react-router-dom';
import { Portfolio } from 'pages/earn/portfolio/Portfolio';
import V3Portfolio from 'elements/earn/portfolio/v3/V3Portfolio';
import { LiquidityProtection } from 'elements/earn/portfolio/liquidityProtection/LiquidityProtection';
import { PoolTokens } from 'elements/earn/portfolio/poolTokens/PoolTokens';
import { RewardsStake } from 'pages/earn/portfolio/rewards/RewardsStake';
import { RewardsClaim } from 'pages/earn/portfolio/rewards/RewardsClaim';
import { BancorRoutes } from 'router/routes.service';
import { PortfolioWelcome } from 'pages/earn/portfolio/PortfolioWelcome';

export const useRoutesPortfolio = (): RouteObject[] => {
  const redirectToWelcome = false;

  const welcomeElement = redirectToWelcome ? (
    <PortfolioWelcome />
  ) : (
    <Navigate to={BancorRoutes.portfolio} />
  );

  const portfolioElement = redirectToWelcome ? (
    <Navigate to={BancorRoutes.welcome} />
  ) : (
    <Portfolio />
  );

  return [
    {
      path: BancorRoutes.welcome,
      element: welcomeElement,
    },
    {
      path: BancorRoutes.portfolio,
      element: portfolioElement,
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
      path: BancorRoutes.portfolioV2RewardsStake(':id'),
      element: <RewardsStake />,
    },
    {
      path: BancorRoutes.portfolioV2RewardsClaim,
      element: <RewardsClaim />,
    },
  ];
};
