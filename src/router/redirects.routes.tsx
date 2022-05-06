import { Navigate, RouteObject, useLocation } from 'react-router-dom';
import { BancorRoutes } from 'router/routes.service';
import { PageTradeQuery } from 'router/trade.routes';

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
      element: <Navigate to={BancorRoutes.trade(tradeSearchParams)} replace />,
    },
    {
      path: '/eth/swap',
      element: <Navigate to={BancorRoutes.trade(tradeSearchParams)} replace />,
    },
    // Legacy routes Earn
    {
      path: '/pools',
      element: <Navigate to={BancorRoutes.earn} replace />,
    },
    {
      path: '/eth/data',
      element: <Navigate to={BancorRoutes.earn} replace />,
    },
    {
      path: '/pools/add-liquidity/:id',
      element: <Navigate to={BancorRoutes.addLiquidityV2(id ?? '')} replace />,
    },
    {
      path: '/eth/portfolio/stake/add/single/:id',
      element: <Navigate to={BancorRoutes.addLiquidityV2(id ?? '')} replace />,
    },
    {
      path: '/eth/pool/add/:id',
      element: (
        <Navigate to={BancorRoutes.addLiquidityV2(id ?? 'error')} replace />
      ),
    },
    // Legacy routes portfolio
    {
      path: '/eth/portfolio',
      element: <Navigate to={BancorRoutes.portfolio} replace />,
    },
    {
      path: '/eth/portfolio/stake/rewards/withdraw',
      element: <Navigate to={BancorRoutes.portfolioV2RewardsClaim} replace />,
    },
    {
      path: '/eth/portfolio/stake/rewards/restake/:id',
      element: (
        <Navigate to={BancorRoutes.portfolioV2RewardsStake(id || '')} replace />
      ),
    },
    // Legacy routes main
    {
      path: '/eth/vote',
      element: <Navigate to={BancorRoutes.vote} replace />,
    },
    {
      path: '/eth/fiat',
      element: <Navigate to={BancorRoutes.fiat} replace />,
    },
  ];
};
