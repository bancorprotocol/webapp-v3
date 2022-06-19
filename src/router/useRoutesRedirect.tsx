import { Navigate, RouteObject, useLocation } from 'react-router-dom';
import { BancorURL } from 'router/bancorURL.service';
import { PageTradeQuery } from 'router/useRoutesTrade';

export const useRoutesRedirect = (): RouteObject[] => {
  const pathSplit = useLocation().pathname.split('/');
  const id = pathSplit[pathSplit.length - 1];
  const searchParams = new URLSearchParams(useLocation().search);
  const tradeSearchParams: PageTradeQuery = {
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    limit: !!searchParams.get('limit'),
  };

  return [
    // Legacy routes trade
    {
      path: '/swap',
      element: <Navigate to={BancorURL.trade(tradeSearchParams)} replace />,
    },
    {
      path: '/eth/swap',
      element: <Navigate to={BancorURL.trade(tradeSearchParams)} replace />,
    },
    // Legacy routes Earn
    {
      path: '/pools',
      element: <Navigate to={BancorURL.earn} replace />,
    },
    {
      path: '/eth/data',
      element: <Navigate to={BancorURL.earn} replace />,
    },
    {
      path: '/pools/add-liquidity/:id',
      element: <Navigate to={BancorURL.addLiquidityV2(id ?? '')} replace />,
    },
    {
      path: '/eth/portfolio/stake/add/single/:id',
      element: <Navigate to={BancorURL.addLiquidityV2(id ?? '')} replace />,
    },
    {
      path: '/eth/pool/add/:id',
      element: (
        <Navigate to={BancorURL.addLiquidityV2(id ?? 'error')} replace />
      ),
    },
    // Legacy routes portfolio
    {
      path: '/eth/portfolio',
      element: <Navigate to={BancorURL.portfolio} replace />,
    },
    {
      path: '/eth/portfolio/stake/rewards/withdraw',
      element: <Navigate to={BancorURL.portfolioV2RewardsClaim} replace />,
    },
    {
      path: '/eth/portfolio/stake/rewards/restake/:id',
      element: (
        <Navigate to={BancorURL.portfolioV2RewardsStake(id || '')} replace />
      ),
    },
    // Legacy routes main
    {
      path: '/eth/vote',
      element: <Navigate to={BancorURL.vote} replace />,
    },
    {
      path: '/eth/fiat',
      element: <Navigate to={BancorURL.fiat} replace />,
    },
    {
      path: '/earn/v2/add-liquidity/:id',
      element: <Navigate to={BancorURL.earnV2} replace />,
    },
  ];
};
