import { Navigate, RouteObject } from 'react-router-dom';
import { Portfolio } from 'pages/earn/portfolio/Portfolio';
import V3Portfolio from 'elements/earn/portfolio/v3/V3Portfolio';
import { LiquidityProtection } from 'elements/earn/portfolio/liquidityProtection/LiquidityProtection';
import { PoolTokens } from 'elements/earn/portfolio/poolTokens/PoolTokens';
import { RewardsStake } from 'pages/earn/portfolio/rewards/RewardsStake';
import { RewardsClaim } from 'pages/earn/portfolio/rewards/RewardsClaim';
import { BancorURL } from 'router/bancorURL.service';
import { PortfolioWelcome } from 'pages/earn/portfolio/PortfolioWelcome';

export const useRoutesPortfolio = (): RouteObject[] => {
  const redirectToWelcome = false;

  const welcomeElement = redirectToWelcome ? (
    <PortfolioWelcome />
  ) : (
    <Navigate to={BancorURL.portfolio} />
  );

  const portfolioElement = redirectToWelcome ? (
    <Navigate to={BancorURL.welcome} />
  ) : (
    <Portfolio />
  );

  return [
    {
      path: BancorURL.welcome,
      element: welcomeElement,
    },
    {
      path: BancorURL.portfolio,
      element: portfolioElement,
      children: [
        {
          index: true,
          element: <V3Portfolio />,
        },
        {
          path: BancorURL.portfolioV2,
          element: <LiquidityProtection />,
        },
        {
          path: BancorURL.portfolioV1,
          element: <PoolTokens />,
        },
      ],
    },
    {
      path: BancorURL.portfolioV2RewardsStake(':id'),
      element: <RewardsStake />,
    },
    {
      path: BancorURL.portfolioV2RewardsClaim,
      element: <RewardsClaim />,
    },
  ];
};
